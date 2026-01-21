import { Elysia, t } from 'elysia';
import { mkdir, writeFile, readdir } from 'node:fs/promises';
import { existsSync, createReadStream } from 'node:fs';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { MessagesConfig } from './src/config/message.config';
import { BunAdapter } from 'elysia/adapter/bun';

const UPLOAD_DIR = './uploads';
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

export const filesRoutes = new Elysia({ name: 'files', prefix: '/api/upload' })

  // -------------------------
  // UPLOAD ENDPOINT
  // -------------------------
    .post('/',
        async ({ body, error }) => {
            console.log(body)
        const files: File[] = body.files;

        if (!files.length) return error(400, 'Žádné soubory');

        const storedFiles = [];
        for (const file of files) {
        if (file.size > MessagesConfig.FILE_MAX_SIZE_MB * 1024 * 1024)
            return error(400, `Soubor ${file.name} je příliš velký`);

        if (!ALLOWED_MIME.includes(file.type))
            return error(400, `Nepovolený typ souboru: ${file.name}`);

        const id = randomUUID();
        const ext = path.extname(file.name);
        const filename = `${id}${ext}`;
        const filepath = path.join(UPLOAD_DIR, filename);

        await writeFile(filepath, Buffer.from(await file.arrayBuffer()));

        storedFiles.push({
            id,
            filename,
            originalName: file.name,
            mime: file.type,
            size: file.size
        });
        }

        return { success: true, files: storedFiles };
    },
    {
        body: t.Object({
            files: t.Any()
        })
    }
  )
  

  // -------------------------
  // DOWNLOAD ENDPOINT
  // -------------------------
  .get(
    '/:id',
    async ({ params, error, set }) => {
      const { id } = params;

      // najdi soubor podle id
      const files = await readdir(UPLOAD_DIR);
      const file = files.find(f => f.startsWith(id));

      if (!file) return error(404, 'Soubor nenalezen');

      const filepath = path.join(UPLOAD_DIR, file);

      // nastavení hlaviček
      set.headers['Content-Type'] = 'application/octet-stream';
      set.headers['Content-Disposition'] = `attachment; filename="${file}"`;

      return createReadStream(filepath);
    }
  );
