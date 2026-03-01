import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';

const app = new Elysia()
  .get('/messages/drafts', async ({ cookie }) => {
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.user_id', 'tokens.user_id')
      .select(['tokens.user_id', 'users.person_id'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth?.person_id) return { error: 'no_user', details: 'no_db' };

    const drafts = await db
      .selectFrom('messages_drafts')
      .selectAll()
      .where('author_id', '=', auth.person_id)
      .orderBy('updated_at', 'desc')
      .execute();

    return { success: true, drafts };
  })
  .post('/messages/draft', async ({ cookie, body }) => {
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.user_id', 'tokens.user_id')
      .select(['tokens.user_id', 'users.person_id'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth?.person_id) return { error: 'no_user', details: 'no_db' };

    const { draft_id, type, topic, message, receivers, require_confirm } = body;

    try {
      if (draft_id) {
        // Update existing draft
        await db.updateTable('messages_drafts')
          .set({
            type: type || 0,
            topic: topic || null,
            message: message || '',
            receivers: receivers ? JSON.stringify(receivers) : null,
            require_confirm: require_confirm || false,
            updated_at: new Date()
          })
          .where('draft_id', '=', draft_id)
          .where('author_id', '=', auth.person_id)
          .execute();

        return { success: true, draft_id };
      } else {
        // Create new draft
        const insertResult = await db.insertInto('messages_drafts')
          .values({
            author_id: auth.person_id,
            type: type || 0,
            topic: topic || null,
            message: message || '',
            receivers: receivers ? JSON.stringify(receivers) : null,
            require_confirm: require_confirm || false,
            updated_at: new Date()
          })
          .executeTakeFirst();
          
        return { success: true, draft_id: Number(insertResult.insertId) };
      }
    } catch (e) {
      return { success: false, error: 'db_error', details: e };
    }
  }, {
    body: t.Object({
      draft_id: t.Optional(t.Number()),
      type: t.Optional(t.Number()),
      topic: t.Optional(t.String()),
      message: t.Optional(t.String()),
      receivers: t.Optional(t.Any()),
      require_confirm: t.Optional(t.Boolean())
    })
  })
  .delete('/messages/draft/:draft_id', async ({ cookie, params }) => {
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.user_id', 'tokens.user_id')
      .select(['tokens.user_id', 'users.person_id'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth?.person_id) return { error: 'no_user', details: 'no_db' };

    try {
      await db.deleteFrom('messages_drafts')
        .where('draft_id', '=', Number(params.draft_id))
        .where('author_id', '=', auth.person_id)
        .execute();

      return { success: true };
    } catch (e) {
      return { success: false, error: 'db_error' };
    }
  });

export default app;
