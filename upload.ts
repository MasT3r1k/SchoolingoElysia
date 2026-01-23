import { Elysia, t } from 'elysia';
import { mkdir, writeFile, readdir, unlink } from 'node:fs/promises';
import { existsSync, createReadStream } from 'node:fs';
import { randomUUID } from 'node:crypto';
import path, { join } from 'node:path';
import { db } from './database';
import { createHash } from 'node:crypto';
import moment from 'moment';

export function checksumFile(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(path);

    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

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

export const uploadAPI = new Elysia()
  .post('/api/upload', async ({ body, cookie }) => {
    const token = cookie.token.value;
    if (!token) {
        return Response.json({ error: 'no_user', details: 'no_cookie' });
    }

    const user = await db.selectFrom("tokens")
        .select([
            'tokens.userId'
        ])
        .where('tokens.token', '=', token)
        .where('tokens.expires', '>=', moment().toDate())
        .limit(1)
        .executeTakeFirst()

    if (!user) {
        return Response.json({ error: 'no_user', details: 'no_db' });
    }

      try {
        console.log('📥 Incoming upload request');
        
        // Získej FormData z raw requestu
        const files = body.files
        
        if (files.length === 0) {
          return { 
            success: false, 
            error: 'Žádné soubory nebyly nahrány' 
          };
        }
  
        const storedFiles = [];
  
        for (const entry of files) {
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
          const arrayBuffer = await file.arrayBuffer();
          const nodeBuffer = Buffer.from(arrayBuffer);

          await writeFile(filepath, nodeBuffer);

          const checksum = createHash('sha256')
            .update(nodeBuffer)
            .digest('hex');

          // Save to database
          db.insertInto('files')
          .values({
            file_uuid: id,
            name: filename,
            real_file_name: originalName,
            file_format: ext,
            mime_type: file.type,
            file_size: file.size,
            storage_path: filepath,
            thumbnail_path: null,
            permissions: JSON.stringify({}),
            owner_id: user.userId,
            checksum
          })
          .executeTakeFirst();
          
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
    }, {
      body: t.Object({
        files: t.Files()
      })
    })


  .delete(
    '/api/delete_file/:id',
    async ({ params, cookie }) => {
      const token = cookie.token.value;
      if (!token) {
        return Response.json({ error: 'no_user', details: 'no_cookie' });
      }

      // Ověření tokenu
      const user = await db
        .selectFrom('tokens')
        .innerJoin('users', 'users.userId', 'tokens.userId')
        .select([
          'tokens.userId',
          'users.manager'
        ])
        .where('tokens.token', '=', token)
        .where('tokens.expires', '>=', moment().toDate())
        .limit(1)
        .executeTakeFirst();

      if (!user) {
        return Response.json({ error: 'no_user', details: 'no_db' });
      }

      const fileId = params.id;

      // Načti soubor
      const file = await db
        .selectFrom('files')
        .select([
          'file_uuid',
          'owner_id',
          'storage_path',
          'name'
        ])
        .where('file_uuid', '=', fileId)
        .limit(1)
        .executeTakeFirst();

      if (!file) {
        return Response.json({ error: 'not_found', details: 'file_not_exists' });
      }

      // Ověření oprávnění
      const isOwner = file.owner_id === user.userId;
      const isManager = user.manager === -1;

      if (!isOwner && !isManager) {
        return Response.json({
          error: 'forbidden',
          details: 'not_owner'
        });
      }

      try {
        // Smazání souboru z disku
        try {
          if (file.storage_path) {
            await unlink(file.storage_path);
            console.log(`🗑️ File removed from disk: ${file.storage_path}`);
          }
        } catch (fsErr) {
          console.warn(`⚠️ File not found on disk: ${file.storage_path}`);
        }

        // Smazání z DB
        await db
          .deleteFrom('files')
          .where('file_uuid', '=', fileId)
          .execute();

        return {
          success: true,
          id: fileId
        };

      } catch (err: any) {
        console.error('❌ Delete error:', err);
        return {
          success: false,
          error: err.message || 'delete_failed'
        };
      }
    }
  )
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
