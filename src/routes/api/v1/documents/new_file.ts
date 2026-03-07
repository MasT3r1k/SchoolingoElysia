import { Elysia, t } from 'elysia';
import moment from 'moment';
import { db } from '../../../../../database';
import { sql } from 'kysely';
import { randomUUID } from 'crypto';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const UPLOAD_DIR = './uploads';

const app = new Elysia().post(
  '/documents/new_file',
  async ({ cookie, body }) => {
    const token = cookie.token?.value as string;
    const { name, parent_id, content } = body;
    if (!token) {
      return Response.json({ error: 'no_user', details: 'no_cookie' });
    }

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'tokens.user_id', 'users.user_id')
      .select([
        'tokens.user_id',
        'users.person_id',
        'users.role'
      ])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', moment().toDate())
      .limit(1)
      .executeTakeFirst();

    if (!auth) {
      return Response.json({ error: 'no_user', details: 'no_db' });
    }

    if (auth.role != "teacher") {
      return Response.json({ error: 'no_permission' });
    }

    if (name == undefined) {
      return Response.json({ error: 'invalid_body' });
    }

    // Check if file name already exists in this folder
    const isExist = await db.selectFrom('documents')
    .select(['documents.document_id'])
    .where('documents.parent_id', parent_id == null ? 'is' : '=', parent_id ?? null)
    .where(sql`LOWER(name)`, '=', name.toLowerCase())
    .executeTakeFirst();
    if (isExist) return { error: 'file_already_created' };

    try {
      const fileId = randomUUID();
      const ext = name.includes('.') ? '.' + name.split('.').pop() : '.txt';
      const storageFilename = `${fileId}${ext}`;
      const filepath = join(UPLOAD_DIR, storageFilename);
      const fileContent = content ?? '';
      
      const nodeBuffer = Buffer.from(fileContent);
      await writeFile(filepath, nodeBuffer);

      const checksum = createHash('sha256')
        .update(nodeBuffer)
        .digest('hex');

      const newFile = await db.insertInto('files')
      .values({
        file_uuid: fileId,
        name: storageFilename,
        real_file_name: name,
        origin: 'documents',
        file_format: ext,
        mime_type: 'text/plain', // Default to text/plain for created files
        file_size: nodeBuffer.length,
        storage_path: storageFilename,
        owner_id: auth.user_id,
        checksum: checksum,
        permissions: JSON.stringify({})
      })
      .executeTakeFirst();

      const newDocument = await db.insertInto('documents')
      .values({
          parent_id,
          name,
          type: 'file',
          file_id: Number(newFile.insertId) ?? null
      })
      .executeTakeFirst();

      return {
          success: true,
          document_id: Number(newDocument.insertId),
          file_id: Number(newFile.insertId) ?? null,
          file_uuid: fileId,
          name,
          parent_id,
          owner_id: auth.user_id,
          created_at: new Date(),
          file_format: ext,
          mime_type: 'text/plain',
          file_size: nodeBuffer.length
      };
    } catch(e: any) {
        console.error('Error creating file:', e);
        return Response.json({ success: false, error: 'internal_error', details: e.message });
    }
  },
  {
    body: t.Object({
        name: t.String(),
        parent_id: t.Nullable(t.Number()),
        content: t.Optional(t.String())
    }),
  }
);

export default app;
