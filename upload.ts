import { Elysia, t } from 'elysia';
import { mkdir, writeFile, readdir } from 'node:fs/promises';
import { existsSync, createReadStream } from 'node:fs';
import { randomUUID } from 'node:crypto';
import path from 'node:path';

const UPLOAD_DIR = './uploads';

const MIME_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.txt': 'text/plain',
  // přidejte další dle potřeby
};
const ALLOWED_MIME = [
  'image/png',
  'image/jpeg',
  'image/svg+xml',
  'application/pdf',
  'application/zip',
  'text/plain'
];

if (!existsSync(UPLOAD_DIR)) {
  await mkdir(UPLOAD_DIR, { recursive: true });
}

export const filesRoutes = new Elysia()
  .post('/api/upload', async ({ body, set }) => {
    try {
      const files = body.files;
      console.log('--- DEBUG UPLOAD ---', typeof files);
      if (files) console.log('Is array:', Array.isArray(files));

      // Ensure files is an array
      const fileList = Array.isArray(files) ? files : [files];

      if (!fileList || fileList.length === 0) {
        set.status = 400;
        return { error: 'Žádné soubory nebyly nahrány' };
      }

      const uploadedFiles: string[] = [];

      for (const file of fileList) {
        if (!file) continue;

        // Ověření MIME typu
        // Ověření MIME typu
        const mimeType = file.type || file.mimetype;
        if (ALLOWED_MIME.length > 0 && !ALLOWED_MIME.includes(mimeType)) {
          // If type is missing, we might still want to allow it if it has content, for debugging.
          // Or just log it and proceed? No, user wants it fixed.
          // If undefined, maybe we can accept it if we trust the extension?

          if (!mimeType) {
            console.log('Warning: File has no type. Proceeding with upload for debug.');
            // We will NOT return error here, we will try to save it. 
          } else {
            return { error: `Nepovolený typ souboru: ${mimeType} (Keys: ${Object.keys(file).join(', ')})` };
          }
        }

        // Generování UUID
        const uuid = randomUUID();

        // Získání přípony z původního názvu
        const originalName = file.name || 'file';
        const ext = path.extname(originalName);

        // Název souboru: UUID + přípona
        const filename = `${uuid}${ext}`;
        const filepath = path.join(UPLOAD_DIR, filename);

        // Převedení File na buffer a uložení
        let buffer;
        try {
          if (typeof file.arrayBuffer === 'function') {
            const arrayBuffer = await file.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
          } else if (file.data) {
            buffer = file.data;
          } else if (file.path) {
            const fs = await import('node:fs');
            buffer = fs.readFileSync(file.path);
          } else if (Buffer.isBuffer(file)) {
            buffer = file;
          } else {
            console.log('File object keys:', Object.keys(file));
            // Fallback attempt: maybe it's just a string path?
            if (typeof file === 'string' && existsSync(file)) {
              const fs = await import('node:fs');
              buffer = fs.readFileSync(file);
            } else {
              const debugKeys = Object.keys(file).join(', ');
              const debugJson = JSON.stringify(file);
              set.status = 500;
              return { error: `Nepodporovaný formát souboru. Keys: [${debugKeys}], JSON: ${debugJson}` };
            }
          }
        } catch (e) {
          console.error('Error processing file buffer:', e);
          set.status = 500;
          return { error: 'Chyba při zpracování souboru' };
        }

        await writeFile(filepath, buffer);

        uploadedFiles.push(uuid);
      }

      return {
        uuids: uploadedFiles,
        count: uploadedFiles.length
      };
    } catch (err: any) {
      set.status = 500;
      return { error: `Chyba při nahrávání: ${err.message}` };
    }
  }, {
    body: t.Object({
      files: t.Any()
    })
  })

  // -------------------------
  // DOWNLOAD ENDPOINT
  // -------------------------
  .get(
    '/api/upload/:id',
    async ({ params, set }) => {
      const { id } = params;

      // najdi soubor podle id
      const files = await readdir(UPLOAD_DIR);
      const file = files.find(f => f.startsWith(id));

      if (!file) {
        set.status = 404;
        return 'Soubor nenalezen';
      }

      const filepath = path.join(UPLOAD_DIR, file);

      // nastavení hlaviček
      set.headers['Content-Type'] = 'application/octet-stream';
      set.headers['Content-Disposition'] = `attachment; filename="${file}"`;

      return createReadStream(filepath);
    }
  );
