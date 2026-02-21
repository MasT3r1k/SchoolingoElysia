import { Elysia, t } from 'elysia';
import { mkdir, writeFile, readdir, unlink } from 'node:fs/promises';
import { existsSync, createReadStream } from 'node:fs';
import { randomUUID } from 'node:crypto';
import path, { join } from 'node:path';
import { db } from './database';
import { createHash } from 'node:crypto';
import moment from 'moment';
import fs from 'fs';
import mime from 'mime-types'; 

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
    const token = cookie.token.value as string;
    if (!token) {
        return Response.json({ error: 'no_user', details: 'no_cookie' });
    }

    const user = await db.selectFrom("tokens")
        .select([
            'tokens.user_id'
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
          const dbFile = await db.insertInto('files')
          .values({
            file_uuid: id,
            name: filename,
            real_file_name: originalName,
            origin: body.origin ?? null,
            file_format: ext,
            mime_type: file.type,
            file_size: file.size,
            storage_path: filename,
            thumbnail_path: null,
            permissions: JSON.stringify({}),
            owner_id: user.user_id,
            checksum
          })
          .executeTakeFirst();
          
          storedFiles.push({
            id: Number(dbFile.insertId),
            uuid: id, 
            filename, 
            originalName, 
            size: file.size,
            type: file.type,
            url: filename
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
        files: t.Files(),
        origin: t.Optional(t.String())
      })
    })


  .delete(
    '/api/delete_file/:id',
    async ({ params, cookie }) => {
      const token = cookie.token.value as string;
      if (!token) {
        return Response.json({ error: 'no_user', details: 'no_cookie' });
      }

      // Ověření tokenu
      const user = await db
        .selectFrom('tokens')
        .innerJoin('users', 'users.user_id', 'tokens.user_id')
        .select([
          'tokens.user_id',
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
    '/api/download/:id',
    async ({ params, set }) => {
      const { id } = params;

      const file = await db
        .selectFrom('files')
        .select([
          'files.storage_path',
          'files.real_file_name' // doporučeno
        ])
        .where('file_uuid', '=', id)
        .executeTakeFirst();

      if (!file || !file.storage_path) {
        set.status = 404;
        return 'Soubor nenalezen';
      }

      // absolutní cesta k souboru
      const filepath = path.resolve(UPLOAD_DIR, file.storage_path);
      console.log(filepath)

      // 🛡️ bezpečnost – nesmí lézt mimo uploads
      if (!filepath.startsWith(path.resolve(UPLOAD_DIR))) {
        set.status = 403;
        return 'Neplatná cesta k souboru';
      }

      if (!existsSync(filepath)) {
        set.status = 404;
        return 'Soubor na disku neexistuje';
      }

      // hlavičky
      set.headers['Content-Type'] = 'application/octet-stream';
      set.headers['Content-Disposition'] =
        `attachment; filename="${encodeURIComponent(
          file.real_file_name ?? path.basename(file.storage_path)
        )}"`;

      return createReadStream(filepath);
    }
  )

  .get(
    '/api/file_info/:id',
    async ({ params, cookie, set }) => {
      const { id } = params;

      const token = cookie.token.value  as string;
      if (!token) {
        return Response.json({ error: 'no_user', details: 'no_cookie' });
      }

      // Ověření tokenu
      const user = await db
        .selectFrom('tokens')
        .innerJoin('users', 'users.user_id', 'tokens.user_id')
        .select([
          'tokens.user_id',
          'users.manager'
        ])
        .where('tokens.token', '=', token)
        .where('tokens.expires', '>=', moment().toDate())
        .limit(1)
        .executeTakeFirst();

      if (!user) {
        return Response.json({ error: 'no_user', details: 'no_db' });
      }

      const file = await db
        .selectFrom('files')
        .select([
          'files.file_id',
          'files.storage_path',
          'files.real_file_name'
        ])
        .where('file_uuid', '=', id)
        .executeTakeFirst();

      if (!file || !file.storage_path) {
        set.status = 404;
        return { error: 'Soubor nenalezen' };
      }

      const filepath = path.resolve(UPLOAD_DIR, file.storage_path);

      // 🛡️ bezpečnost – nesmí mimo uploads
      if (!filepath.startsWith(path.resolve(UPLOAD_DIR))) {
        set.status = 403;
        return { error: 'Neplatná cesta k souboru' };
      }

      if (!existsSync(filepath)) {
        set.status = 404;
        return { error: 'Soubor na disku neexistuje' };
      }

      // ⚠️ jen textové soubory (ochrana RAM)
      const stat = await fs.promises.stat(filepath);
      const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

      if (stat.size > MAX_SIZE) {
        set.status = 413;
        return { error: 'Soubor je příliš velký pro načtení obsahu' };
      }

      // načtení obsahu
      const content = await fs.promises.readFile(filepath, 'utf-8');

      const lines = content === ''
        ? 0
        : content.split(/\r?\n/).length;

      // Generace tokenu pro načtení bez oprávnění
      const access_token = randomUUID();
      const expire_at = new Date(Date.now() + 15 * 60 * 1000); // 24 hodin

      await db
        .insertInto('files_tokens')
        .values({
          file_id: file.file_id,
          access_token,
          expire_at,
          token_owner: user.user_id,
        })
        .execute();

        return {
          file_name: file.real_file_name,
          size: stat.size,
          lines,
          content: content,
          access_token
        };
    }
  )

.get('/api/file/:id', async ({ query, params, cookie, set }) => {
  const { id } = params;
  const { access_token } = query;
  const token = cookie.token.value as string;
  if (!token && !access_token) {
    return Response.json({ error: 'no_user', details: 'no_cookie' });
  }

  if (token && !access_token) {
    // Ověření tokenu
    const user = await db
      .selectFrom('tokens')
      .innerJoin('users', 'users.user_id', 'tokens.user_id')
      .select([
        'tokens.user_id',
        'users.manager'
      ])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', moment().toDate())
      .limit(1)
      .executeTakeFirst();

    if (!user) {
      return Response.json({ error: 'no_user', details: 'no_db' });
    }
  }

  if (access_token) {
    const has_access = await db.selectFrom('files_tokens')
    .leftJoin('files', 'files.file_id', 'files_tokens.file_id')
    .select([
      'files_tokens.used_count',
      'files_tokens.file_id'
    ])
    .where('files.file_uuid', '=', id)
    .where('files_tokens.access_token', '=', access_token)
    .where('files_tokens.expire_at', '>=', moment().toDate())
    .executeTakeFirst();

    if (!has_access) return Response.json({ error: 'no_access', details: 'access_token_dont_have_access' });
    db.updateTable('files_tokens')
    .set({
      used_count: has_access.used_count + 1
    })
    .where('files_tokens.file_id', '=', has_access.file_id)
    .where('files_tokens.access_token', '=', access_token)
    .executeTakeFirst()
  }

  const file = await db
    .selectFrom('files')
    .select(['files.storage_path', 'files.real_file_name'])
    .where('file_uuid', '=', id)
    .executeTakeFirst();

  if (!file || !file.storage_path) {
    set.status = 404;
    return { error: 'Soubor nenalezen' };
  }

  const filepath = path.resolve(UPLOAD_DIR, file.storage_path);

  if (!filepath.startsWith(path.resolve(UPLOAD_DIR))) {
    set.status = 403;
    return { error: 'Neplatná cesta k souboru' };
  }

  if (!fs.existsSync(filepath)) {
    set.status = 404;
    return { error: 'Soubor na disku neexistuje' };
  }

  const mimeType = mime.lookup(filepath) || 'application/octet-stream';

  // Nastavit hlavičky
  set.headers = {
    'Content-Type': mimeType,
    'Content-Disposition': `inline; filename="${file.real_file_name}"`,
  };

  // Vrátit stream souboru
  const fileStream = fs.createReadStream(filepath);
  return fileStream;
});