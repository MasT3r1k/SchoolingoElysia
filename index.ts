import { Elysia } from 'elysia';
import { ip } from 'elysia-ip';
import { elysiaXSS } from 'elysia-xss';
import { helmet } from 'elysia-helmet';
import * as fs from 'fs';
import path, { join } from 'path';
import 'dotenv/config';
import cors from '@elysiajs/cors';
import { config } from './src/config/app.config';
import { errorHandler } from './src/middleware/error.middleware';
import { rateLimit } from './src/middleware/rate-limit.middleware';
import { logger, requestLogger } from './src/utils/logger';
import locales from './src/infrastructure/locale';
import { version } from './version';
import { ws } from './websocket';
import { getAuthUser } from './src/utils/auth';
import { uploadAPI } from './upload';
import { Mailer } from "./mailer.module";


const UPLOAD_DIR = './uploads';

export const app = new Elysia({
    serve: {
      idleTimeout: 30,
      maxRequestBodySize: 1024 * 1024 * 5000 
    },
  })
  // Security Headers
.use(cors({
    origin: (request) => {
      const origin = request.headers.get('origin');
      
      // Allow requests with no origin
      if (!origin) {
        return true;
      }
      
      // Allow any localhost origin or Capacitor/Ionic
      if (origin.startsWith('http://localhost:') || 
          origin.startsWith('https://localhost:') || 
          origin.startsWith('http://127.0.0.1:') ||
          origin.startsWith('capacitor://') || 
          origin.startsWith('ionic://')) {
        return true;
      }

      const allowedOrigins = [
        'http://localhost:4200', 
        'http://localhost:4222', 
        'http://localhost:5173', 
        'http://localhost:8100', 
        'http://127.0.0.1:4200',
        'capacitor://localhost', 
        'ionic://localhost'
      ];
      
      if (allowedOrigins.includes(origin)) return true;
      return false;
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true,
  }))
  .use(helmet({
    contentSecurityPolicy: false,
  }))
  .use(ip())
  .use(errorHandler)
  .use(requestLogger)
  .use(rateLimit)
  .use(version)
  .use(uploadAPI)
  .use(version)
  
  // Authentication & Context Derivation
  .derive(async ({ cookie }) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    return { user };
  })
  
  .use(ws)
  .use(locales);

// Routing Automation
const modulePath: string = path.join(__dirname, '/src/routes');

async function loadFolder(folder: string = modulePath) {
  try {
    const files = await fs.promises.readdir(folder);
    for (const [index, file] of files.entries()) {
      const fullPath = path.join(folder, file);
      
      if (file.includes('.')) {
        if (!file.endsWith('.ts') || file.endsWith('.d.ts')) continue;
        
        const start = Date.now();
        let relativePath = fullPath.replace(modulePath, '');
        relativePath = relativePath.split(path.sep).join('/');
        
        console.log('[🦊 Elysia]: Loading ' + file);

        const mod = await import(fullPath);
        const routeApp: Elysia = mod.default;

        if (!routeApp || typeof routeApp !== 'object' || typeof routeApp.handle !== 'function') {
          console.warn(`File ${file} does not export a valid Elysia instance`);
          continue;
        }

        let prefix = "";
        const parts = relativePath.split('/');
        
        if (parts.length > 2 && parts[1] === 'api') {
          prefix = `/api/${parts[2]}`;
        }
        
        const wrapper = new Elysia({ prefix })
        .use(routeApp);
        app.use(wrapper);

        const end = Date.now();
        console.log(`[🦊 Elysia]: Loaded ${file} at ${prefix} in ${end - start}ms`);
      } else {
        await loadFolder(fullPath);
      }
    }

  } catch (err: any) {
    if (err?.code === 'ENOENT') {
      await fs.promises.mkdir(folder, { recursive: true });
      logger.log('[📁 FileManager] Created /routes folder.');
    } else {
      logger.log('ERROR: ' + err);
    }
  }
}

(async () => {
  try {
    logger.log('Database tables initialized successfully');

    await loadFolder(modulePath);
    const port = parseInt(config.PORT);
    await app.listen(port);
    logger.log(`[🦊 Elysia]: Running at http://${app.server?.hostname}:${port}`);
    logger.log(`[🌍 Environment]: ${config.NODE_ENV}`);


    Mailer.init({
      enabled: config.STMP_ENABLED == "true" ? true : false,
      host: config.STMP_HOST || '',
      port: parseInt(config.STMP_PORT || '587'),
      secure: parseInt(config.STMP_PORT || '587') == 465,
      user: config.STMP_USER || '',
      pass: config.STMP_PASS || '',
      fromName: config.STMP_NAME || 'Schoolingo',
      debug: true
    });

    // Initialize Backup Scheduler
    try {
        const { backupService } = await import('./src/functions/backup.service');
        const { db } = await import('./database');
        const school = await db.selectFrom('schools')
            .select('backup_interval')
            .executeTakeFirst();
        
        if (school && school.backup_interval !== null) {
            let hours = 24;
            if (school.backup_interval === 1) hours = 168;
            if (school.backup_interval === 2) hours = 720;
            await backupService.updateInterval(hours);
        }
        backupService.startScheduler();
    } catch (err) {
        console.warn('[Backup] Scheduler init failed (likely missing column):', err);
    }

    // Initialize Update Scheduler
    try {
        const { db } = await import('./database');
        const autoUpdate = await db.selectFrom('schools')
            .select(['auto_update', 'auto_update_interval'])
            .executeTakeFirst();
        
        if (autoUpdate && autoUpdate.auto_update) {
            const { updateService } = await import('./src/functions/update.service');
            updateService.startScheduler(autoUpdate.auto_update_interval);
        }
    } catch (err) {
        console.warn('[Update] Scheduler init failed (likely missing column):', err);
    }

  } catch (error) {
    logger.log('Failed to start application:' + error);
    process.exit(1);
  }
})();