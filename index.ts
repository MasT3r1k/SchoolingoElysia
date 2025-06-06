import swagger from '@elysiajs/swagger';
import { Elysia, file } from 'elysia';
import { ip } from 'elysia-ip';
import { elysiaXSS } from 'elysia-xss';
import * as fs from 'fs';
import path from 'path';
import 'dotenv/config';
import cors from '@elysiajs/cors';
import locales from './src/infrastructure/locale';


const version = (version: number, build: number) => new Elysia()
  .get('/version', version + ' #' + build);

const ws = new Elysia()
  .ws('/ws', {
      message(ws, message) {
          ws.send(message)
      }
  })
  .listen(3000)


export const app = new Elysia({
  serve: {
		// Seconds to timeout idle connections
    idleTimeout: 30,
	},
})
  .use(ip())
  .use(cors())
  .use(elysiaXSS({}))
  .use(version(1.1, 15))
  .use(locales)
  .use(ws)

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
          console.warn(`Soubor ${file} neexportuje validní Elysia instanci`);
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
  await loadFolder(modulePath);
  if (process.env['DEVELOPMENT'] == "true") {
    const docs = new Elysia()
    .use(swagger({
      path: '/swagger',
      documentation: {
        info: {
          title: 'Schoolingo API',
          version: '1.0.0'
        }
      }
    }));
    await app.use(docs);
  } 

  await app.listen(3000);
  console.log(`[🦊 Elysia]: Running at http://${app.server?.hostname}:${app.server?.port}`);

  app.onError((error) => {
    console.error('Unexpected error:', error);
  });
})();
