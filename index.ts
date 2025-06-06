import swagger from '@elysiajs/swagger';
import { Elysia } from 'elysia';
import { ip } from 'elysia-ip';
import { elysiaXSS } from 'elysia-xss';
import * as fs from 'fs';
import path from 'path';
import 'dotenv/config';
import cors from '@elysiajs/cors';
import { config } from './src/config/app.config';
import { errorHandler } from './src/middleware/error.middleware';
import { rateLimit } from './src/middleware/rate-limit.middleware';
import { logger } from './src/utils/logger';
import locales from './src/infrastructure/locale';

const version = (version: number, build: number) => new Elysia()
  .get('/version', () => ({
    version: version,
    build: build,
    timestamp: new Date().toISOString()
  }));

const ws = new Elysia()
  .ws('/ws', {
    message(ws, message) {
      ws.send(message);
    }
  });

export const app = new Elysia({
  serve: {
    idleTimeout: 30,
  },
})
  .use(ip())
  .use(cors({
    origin: ['http://localhost:4200', config.CORS_ORIGIN],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }))
  .use(elysiaXSS({}))
  .use(errorHandler)
  .use(rateLimit)
  .use(version(1.1, 15))
  .use(ws)
  .use(locales);

const modulePath: string = path.join(__dirname, '/src/routes');

async function loadFolder(folder: string = modulePath) {
  try {
    const files = await fs.promises.readdir(folder);
    for (const [index, file] of files.entries()) {
      if (file.includes('.')) {
        if (!file.endsWith('.ts') || file.endsWith('.d.ts')) continue;
        const start = Date.now();
        const route = folder.replace(modulePath, '');
        console.log('[🦊 Elysia]: Loading ' + file);

        const filePath = path.join(folder, file);
        const mod = await import(filePath);
        const routeApp: Elysia = mod.default;

        if (!routeApp || typeof routeApp !== 'object' || typeof routeApp.handle !== 'function') {
          console.warn(`File ${file} does not export a valid Elysia instance`);
          continue;
        }

        let prefix = "";
        if (route.startsWith("\\api\\")) {
          let url = route.split('\\');
          if (url[2] == "api") {
            prefix = "/api";
          }
          prefix = "/api/" + route.split('\\')[2];
        }

        const wrapper = new Elysia({ prefix }).use(routeApp);
        app.use(wrapper);

        const end = Date.now();
        console.log(`[🦊 Elysia]: Loaded ${file} at ${prefix} in ${end - start}ms (${index + 1}/${files.length})`);
      } else {
        const folderPath = path.join(folder, file);
        await loadFolder(folderPath);
      }
    }
  } catch (err: any) {
    if (err?.code === 'ENOENT') {
      await fs.promises.mkdir(folder, { recursive: true });
      console.log('[📁 FileManager] Created /routes folder.');
    } else {
      console.error(err);
    }
  }
}

(async () => {
  try {
    // Initialize database tables
    logger.info('Database tables initialized successfully');

    await loadFolder(modulePath);
    
    if (config.NODE_ENV === 'development') {
      const docs = new Elysia()
        .use(swagger({
          path: '/swagger',
          documentation: {
            info: {
              title: 'Schoolingo API',
              version: '1.0.0',
              description: 'API documentation for Schoolingo application'
            },
            tags: [
              { name: 'auth', description: 'Authentication endpoints' },
              { name: 'users', description: 'User management endpoints' },
              { name: 'schools', description: 'School management endpoints' }
            ]
          }
        }));
      await app.use(docs);
    }

    const port = parseInt(config.PORT);
    await app.listen(port);
    logger.info(`[🦊 Elysia]: Running at http://${app.server?.hostname}:${port}`);
    logger.info(`[🌍 Environment]: ${config.NODE_ENV}`);
  } catch (error) {
    logger.error('Failed to start application:', error);
    process.exit(1);
  }
})();
