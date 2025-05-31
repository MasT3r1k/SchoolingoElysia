import { Elysia } from 'elysia';
import * as fs from 'fs';
import path from 'path';
import 'dotenv/config';

// Absolutní cesta ke složce locales
const LOCALES_DIR = path.join(__dirname, '../locales');

// Cache pro dynamické importy (např. locale.ts)
const moduleCache = new Map<string, any>();

// Cache pro JSON překlady
const jsonCache = new Map<string, string>();

const locales = new Elysia({ prefix: "/locales" })

// GET /locales - načte všechny non-json moduly (např. .ts)
.get('/', async () => {
  const files = await fs.promises.readdir(LOCALES_DIR);
  const fileList: Record<string, any>[] = [];

  for (const file of files) {
    if (file.endsWith('.json')) continue;

    // Cache kontrola
    if (moduleCache.has(file)) {
      fileList.push(moduleCache.get(file));
      continue;
    }

    const modulePath = path.join(LOCALES_DIR, file);
    try {
      let content = (await import(modulePath)).default;
      content.file = file.replace('.ts', '');
      moduleCache.set(file, content);
      fileList.push(content);
    } catch (err) {
      console.error(`Chyba při načítání ${file}:`, err);
    }
  }

  return new Response(JSON.stringify(fileList), {
    headers: { 'Content-Type': 'application/json' }
  });
})

// GET /locales/:language - načte konkrétní překlad jako .json
.get('/:language', async ({ params }) => {
  const languageFile = `${params.language}.json`;

  // Validace názvu souboru proti path traversal
  if (!/^[a-zA-Z0-9_-]+$/.test(params.language)) {
    return new Response(JSON.stringify({ error: 'Invalid language format' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

//   // Cache hit
//   if (jsonCache.has(languageFile)) {
//     return new Response(jsonCache.get(languageFile)!, {
//       headers: { 'Content-Type': 'application/json' }
//     });
//   }

  const filePath = path.join(LOCALES_DIR, languageFile);

  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    const content =JSON.stringify(await fs.promises.readFile(filePath, 'utf-8')).replace(/\\r\\n/g, '').replace(/\\"/g, '"').replace(/  /g, '').slice(1, -1);
    jsonCache.set(languageFile, content);

    return new Response(content, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Language file not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

export default locales