import { Elysia, t } from 'elysia';
import moment from 'moment';
import { db } from '../../../../../database';

const app = new Elysia().post(
  '/documents/rename_file',
  async ({ cookie, body }) => {
    const token = cookie.token?.value as string;
    const { file_id, name } = body;
    if (file_id === undefined || name == undefined) {
        return Response.json({}, { status: 422 });
    }
    if (!token) {
      return Response.json({ error: 'no_user', details: 'no_cookie' }, { status: 401 });
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
      return Response.json({ error: 'no_user', details: 'no_db' }, { status: 401 });
    }

    if (auth.role != "teacher") {
      return Response.json({ error: 'no_permission' }, { status: 403 });
    }

    // === Get File ===
    const isExist = await db.selectFrom('documents')
    .select([
        'documents.file_id',
        'documents.parent_id'
    ])
    .where('documents.file_id', '=', file_id)
    .executeTakeFirst();
    if (!isExist) return Response.json({ error: 'folder_not_exist' }, { status: 422 })

    // === Check if exist file with that name ===
    const isNewFileExist = await db.selectFrom('documents')
    .select([
        'documents.file_id'
    ])
    .where('documents.name', '=', name)
    .where('documents.parent_id', isExist.parent_id == null ? 'is' : '=', isExist.parent_id ?? null)
    .executeTakeFirst();
    if (isNewFileExist) {
        return Response.json({ error: 'folder_already_exist' }, { status: 422 })
    }

    try {
        const renameFolder = await db.updateTable('documents')
        .set({
            name,
        })
        .where('documents.file_id', '=', file_id)
        .executeTakeFirst();

        return {
            success: true,
            name
        };
    } catch(e) {
        return Response.json({ success: false }, { status: 500 });
    }
  },
  {
    body: t.Object({
        file_id: t.Optional(t.Number()),
        name: t.Optional(t.String())
    }),
  }
);

export default app;
