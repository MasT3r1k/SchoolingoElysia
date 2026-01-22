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
import { filesRoutes } from './upload';
import { randomUUID } from 'crypto';
import { writeFile } from 'fs/promises';

const UPLOAD_DIR = './uploads';

export const app = new Elysia({
    serve: {
      idleTimeout: 30,
      maxRequestBodySize: 1024 * 1024 * 500 
    },
  })
  // Security Headers
  // .use(ip())
  .use(cors({
    origin: ['http://localhost:4200', 'http://localhost:8100', 'http://192.168.1.102:4200', 'capacitor://localhost', 'ionic://localhost'],
    credentials: true,
  }))
  // .use(requestLogger)
  .post('/api/upload', async ({ request }) => {
    try {
      console.log('📥 Incoming upload request');
      
      // Získej FormData z raw requestu
      const formData = await request.formData();
      
      console.log('📋 FormData entries:');
      const allEntries = Array.from(formData.entries());
      console.log(`Total entries: ${allEntries.length}`);
      
      for (const [key, value] of allEntries) {
        console.log(`  - ${key}: ${value?.constructor?.name}`);
        if (value instanceof File) {
          console.log(`    ✓ File: ${value.name} (${value.size} bytes, ${value.type})`);
        }
      }
      
      // Získej všechny soubory s klíčem 'files'
      const filesEntries = formData.getAll('files');
      console.log(`\n📦 Found ${filesEntries.length} file entries`);
      
      if (filesEntries.length === 0) {
        return { 
          success: false, 
          error: 'Žádné soubory nebyly nahrány' 
        };
      }

      const storedFiles = [];

      for (const entry of filesEntries) {
        if (!(entry instanceof File)) {
          console.log(`⚠️  Entry is not a File: ${typeof entry}`);
          continue;
        }

        const file = entry as File;
        const originalName = file.name || `file_${randomUUID()}.bin`;
        const ext = originalName.includes('.') 
          ? '.' + originalName.split('.').pop() 
          : '.bin';
        const id = randomUUID();
        const filename = `${id}${ext}`;
        const filepath = join(UPLOAD_DIR, filename);

        console.log(`💾 Saving: ${originalName} → ${filename}`);

        // Uložení souboru
        const buffer = await file.arrayBuffer();
        await writeFile(filepath, Buffer.from(buffer));
        
        storedFiles.push({ 
          id, 
          filename, 
          originalName, 
          size: file.size,
          type: file.type,
          url: `/uploads/${filename}`
        });
        
        console.log(`✓ Saved: ${filename} (${file.size} bytes)`);
      }

      console.log(`\n✅ Successfully uploaded ${storedFiles.length} files\n`);

      return { 
        success: true, 
        files: storedFiles 
      };
      
    } catch (err: any) {
      console.error('❌ Upload error:', err);
      return { 
        success: false, 
        error: err.message || 'Unknown error' 
      };
    }
  })
  // .use(version)
  
  // Authentication & Context Derivation
  // .derive(async ({ cookie }) => {
  //   const user = await getAuthUser(cookie?.token?.value, cookie);
  //   return { user };
  // })
  
  // .use(ws)
  // .use(locales);

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

    // await loadFolder(modulePath);
    const port = parseInt(config.PORT);
    await app.listen(port);
    logger.log(`[🦊 Elysia]: Running at http://${app.server?.hostname}:${port}`);
    logger.log(`[🌍 Environment]: ${config.NODE_ENV}`);
  } catch (error) {
    logger.log('Failed to start application:' + error);
    process.exit(1);
  }
})();
