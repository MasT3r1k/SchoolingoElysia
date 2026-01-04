import { Elysia, t } from 'elysia';
import moment from 'moment';
import { db } from '../../../../../database';
import { sql } from 'kysely';

const app = new Elysia().post(
  '/documents/new_folder',
  async ({ cookie, body }) => {
    const token = cookie.token.value;
    const { name, parent_id } = body;
    if (!token) {
      return Response.json({ error: 'no_user', details: 'no_cookie' });
    }

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'tokens.userId', 'users.userId')
      .select([
        'tokens.userId',
        'users.person',
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

    // Check if folder name is already exist
    const isExist = await db.selectFrom('documents')
    .select(['documents.file_id'])
    .where('documents.parent_id', parent_id == null ? 'is' : '=', parent_id ?? null)
    .where(sql`LOWER(name)`, '=', name.toLowerCase())
    .executeTakeFirst();
    if (isExist) return { error: 'folder_already_created' }

    try {
        const newFolder = await db.insertInto('documents')
        .values({
            parent_id,
            name,
            type: 'folder',
            permissions: 'no-one',
            owner_id: auth.userId
        })
        .executeTakeFirst();

        return {
            success: true,
            file_id: Number(newFolder.insertId),
            name,
            parent_id,
            owner_id: auth.userId,
            created_at: new Date()
        };
    } catch(e) {
        return Response.json({ success: false });
    }
  },
  {
    body: t.Object({
        name: t.String(),
        parent_id: t.Nullable(t.Number())
    }),
  }
);

export default app;
