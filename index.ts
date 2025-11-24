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
import { logger, requestLogger } from './src/utils/logger';
import locales from './src/infrastructure/locale';
import { exec, execSync } from 'child_process';
import { gitService, version } from './version';

function getLocalCommit(): string {
    try {
        return execSync("git rev-parse HEAD").toString().trim();
    } catch (err) {
        console.error("Failed to get local commit:", err);
        return "unknown";
    }
}

function fetchRemoteCommit(): Promise<string> {
    return new Promise((resolve) => {
        exec("git fetch origin main --quiet", (err) => {
            if (err) {
                console.error("Failed to fetch remote:", err);
                return resolve("unknown");
            }

            exec("git rev-parse origin/main", (err2, stdout) => {
                if (err2) {
                    console.error("Failed to get remote commit:", err2);
                    return resolve("unknown");
                }

                resolve(stdout.toString().trim());
            });
        });
    });
}

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
    origin: ['http://localhost:4200', 'http://192.168.1.102:4200'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }))
  .use(elysiaXSS({}))
  .use(errorHandler)
  .use(requestLogger)
  .use(rateLimit)
  .use(version)
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

        const wrapper = new Elysia({ prefix }).use(requestLogger).use(routeApp);
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
    logger.log('Database tables initialized successfully');

    await loadFolder(modulePath);
    const port = parseInt(config.PORT);
    await app.listen(port);
    logger.log(`[🦊 Elysia]: Running at http://${app.server?.hostname}:${port}`);
    logger.log(`[🌍 Environment]: ${config.NODE_ENV}`);
  } catch (error) {
    logger.log('Failed to start application:' + error);
    process.exit(1);
  }
})();
