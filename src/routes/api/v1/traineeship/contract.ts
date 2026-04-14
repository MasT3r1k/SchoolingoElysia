import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';

const app = new Elysia()
  .post(
    '/traineeship/contract',
    async ({ body, cookie, set }) => {
      const token = cookie.token?.value as string;
      if (!token) return { error: 'no_token' };

      const auth = await db
        .selectFrom('tokens')
        .leftJoin('users', 'users.user_id', 'tokens.user_id')
        .select(['tokens.user_id', 'users.person_id'])
        .where('tokens.token', '=', token)
        .where('tokens.expires', '>=', new Date())
        .executeTakeFirst();

      if (!auth?.person_id) return { error: 'no_token' };

      const { traineeship } = body;

      if (!traineeship) return { error: 'no_traineeship' };

      // Make a dummy PDF to pass back to the frontend correctly
      const dummyPdfContent = `%PDF-1.4\n1 0 obj\n<< /Title (Contract) >>\nendobj\n`;

      set.headers['Content-Type'] = 'application/pdf';
      set.headers['Content-Disposition'] = 'attachment; filename="contract.pdf"';

      return new Response(dummyPdfContent, {
        headers: { 'Content-Type': 'application/pdf' }
      });
    },
    {
      body: t.Object({
        traineeship: t.Number()
      })
    }
  );

export default app;
