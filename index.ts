import * as Sentry from '@sentry/elysia';
import { Elysia } from 'elysia';
import { ip } from 'elysia-ip';
import { helmet } from 'elysia-helmet';
import cors from '@elysiajs/cors';
import * as fs from 'node:fs';
import path from 'node:path';
import 'dotenv/config';

import {
  env,
  db,
  checkDatabaseHealth,
  closeDatabaseConnection,
  initSentry,
  sentryPlugin,
  swaggerPlugin,
  errorPlugin,
  loggerPlugin,
  globalRateLimiter,
  authContext,
  schoolGuard,
  wsRouter,
  Mailer,
} from '@core';
import { appRouter } from '@modules/app.router';
import { canteenCron } from './src/crons/canteen.cron';
import { ldapRoutes } from '@functions/ldap.service';
import locales from './src/infrastructure/locale';

// Initialize Sentry first
initSentry();

export const app = Sentry.withElysia(
  new Elysia({
    serve: {
      idleTimeout: 30,
      maxRequestBodySize: 1024 * 1024 * 500, // 500MB max payload
    },
  })
)
  // 1. Core Plugins & Telemetry
  .use(sentryPlugin)
  .use(loggerPlugin)
  .use(errorPlugin)
  .use(swaggerPlugin)

  // 2. Security Middleware
  .use(
    cors({
      origin: (request) => {
        const origin = request.headers.get('origin');
        if (!origin) return true;

        if (
          origin.startsWith('http://localhost:') ||
          origin.startsWith('https://localhost:') ||
          origin.startsWith('http://127.0.0.1:') ||
          origin.startsWith('capacitor://') ||
          origin.startsWith('ionic://')
        ) {
          return true;
        }

        const allowedOrigins = [
          'http://localhost:4200',
          'http://localhost:4222',
          'http://localhost:5173',
          'http://localhost:8100',
          'http://127.0.0.1:4200',
          'capacitor://localhost',
          'ionic://localhost',
        ];

        return allowedOrigins.includes(origin);
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Domain', 'Host', 'X-School-Domain'],
      exposeHeaders: ['X-Session-Expires', 'Retry-After'],
      credentials: true,
    })
  )
  .use(
    helmet({
      contentSecurityPolicy: false,
    })
  )
  .use(ip())
  .use(globalRateLimiter)

  // 3. Guards & Context
  .use(schoolGuard)
  .use(authContext)

  // 4. Domain & App Routers
  .use(appRouter)
  .use(wsRouter)
  .use(locales)
  .use(ldapRoutes)
  .use(canteenCron);

// 5. Dynamic Route Loader for Existing API Modules
const modulePath: string = path.join(__dirname, '/src/routes');

async function loadFolder(folder: string = modulePath) {
  try {
    const files = await fs.promises.readdir(folder);
    for (const file of files) {
      const fullPath = path.join(folder, file);

      if (file.includes('.')) {
        if (!file.endsWith('.ts') || file.endsWith('.d.ts')) continue;

        let relativePath = fullPath.replace(modulePath, '');
        relativePath = relativePath.split(path.sep).join('/');

        try {
          const mod = await import(fullPath);
          const routeApp: Elysia = mod.default;

          if (!routeApp || typeof routeApp !== 'object' || typeof routeApp.handle !== 'function') {
            continue;
          }

          let prefix = '';
          const parts = relativePath.split('/');

          if (parts.length > 2 && parts[1] === 'api') {
            prefix = `/api/${parts[2]}`;
          }

          const wrapper = new Elysia({ prefix }).use(routeApp);
          app.use(wrapper);
        } catch (e) {
          console.error(`[Router]: Failed loading route file: ${file}`, e);
        }
      } else {
        await loadFolder(fullPath);
      }
    }
  } catch (err: any) {
    if (err?.code === 'ENOENT') {
      await fs.promises.mkdir(folder, { recursive: true });
    } else {
      console.error('[Router]: Error scanning route folder:', err);
    }
  }
}

// Pre-load all routes before starting or testing
await loadFolder(modulePath);

// 6. Application Lifecycle Bootstrap (runs only when started directly, not under test)
if (process.env.NODE_ENV !== 'test') {
  (async () => {
    try {
      const isDbHealthy = await checkDatabaseHealth();
      if (!isDbHealthy) {
        console.warn('[⚠️ Database]: Connection check failed during startup');
      } else {
        console.log('[📦 Database]: Pool connected and healthy');
      }

      const port = env.PORT;
      await app.listen(port);
      console.log(`[🦊 Elysia]: Running at http://${app.server?.hostname}:${port}`);
      console.log(`[📚 Documentation]: Interactive Scalar API docs at http://${app.server?.hostname}:${port}/docs`);
      console.log(`[🌍 Environment]: ${env.NODE_ENV}`);

      // Initialize Mailer
      Mailer.init();

      // Initialize Services (Backup, Auto-Update, Heartbeat)
      try {
        const { backupService } = await import('@functions/backup.service');
        const school = await db.selectFrom('schools').select('backup_interval').executeTakeFirst();

        if (school && school.backup_interval !== null) {
          let hours = 24;
          if (school.backup_interval === 1) hours = 168;
          if (school.backup_interval === 2) hours = 720;
          await backupService.updateInterval(hours);
        }
        await backupService.startScheduler();
      } catch (err) {
        console.warn('[Backup]: Scheduler init skipped:', err);
      }

      try {
        const { updateService } = await import('@functions/update.service');
        const autoUpdate = await db
          .selectFrom('schools')
          .select(['auto_update', 'auto_update_interval'])
          .executeTakeFirst();

        if (autoUpdate && autoUpdate.auto_update) {
          updateService.startScheduler(autoUpdate.auto_update_interval);
        }
      } catch (err) {
        console.warn('[Update]: Scheduler init skipped:', err);
      }

      try {
        const { heartbeatService } = await import('@functions/heartbeat.service');
        await heartbeatService.start();

        const shutdown = async () => {
          console.log('\n[Server]: Graceful shutdown initiated...');
          await heartbeatService.stop();
          await closeDatabaseConnection();
          process.exit(0);
        };

        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);
      } catch (err) {
        console.warn('[Heartbeat]: Service init skipped:', err);
      }
    } catch (error) {
      console.error('[Fatal Error]: Failed to start application:', error);
      process.exit(1);
    }
  })();
}
