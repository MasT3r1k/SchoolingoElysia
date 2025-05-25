import swagger from '@elysiajs/swagger';
import { Elysia } from 'elysia';
import { ip } from 'elysia-ip';
import { rateLimit } from 'elysia-rate-limit';
import { elysiaXSS } from 'elysia-xss';
import * as fs from 'fs';
import path from 'path';
import 'dotenv/config';


const version = (version: number, build: number) => new Elysia()
  .get('/version', version + ' #' + build);

const userAPI = new Elysia({
  prefix: "/user"
})
  .use(rateLimit({
    max: 3,
    duration: 15000,
    scoping: 'scoped',
    errorResponse: new Response(JSON.stringify({ message: "rate-limited" }), {
      status: 429,
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    })
  }))
  .get('/', (ip) => ip);

const getSchool = new Elysia({
  prefix: "/v1/school"
})
  .get('/', () => "Schoolingo API")
  .get('/info', () => "This is a school API");

const API = new Elysia({
  prefix: "/api"
})
  .use(getSchool);

export const app = new Elysia()
  .use(ip())
  .use(elysiaXSS({}))
  .use(version(1.1, 15))
  .use(userAPI)
  .use(API);

const modulePath: string = path.join(__dirname, '/routes');

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
