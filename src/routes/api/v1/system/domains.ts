import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { getAuthUser } from '../../../../utils/auth';

const app = new Elysia()
  .derive(async ({ cookie }) => ({
      user: await getAuthUser(cookie?.token?.value as string | undefined)
  }))
  .post('/system/domain', async ({ user, body }) => {
    if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
    if (user.manager !== -1 && !user.isPrincipal) {
      return Response.json({ error: 'no_permission' }, { status: 403 });
    }

    const { domain } = body;
    const schoolId = user.school || 1;

    const existing = await db.selectFrom('school_domains')
      .selectAll()
      .where('domain', '=', domain)
      .where('school', '=', schoolId)
      .executeTakeFirst();
    
    if (existing) {
        return Response.json({ error: 'domain_exists' }, { status: 400 });
    }

    await db.insertInto('school_domains')
      .values({
        school: schoolId,
        domain
      })
      .execute();

    return Response.json({ success: true });
  }, {
    body: t.Object({
        domain: t.String()
    })
  })
  .delete('/system/domain', async ({ user, body }) => {
    if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
      if (user.manager !== -1 && !user.isPrincipal) {
        return Response.json({ error: 'no_permission' }, { status: 403 });
      }

    const { domainId } = body;
    
    await db.deleteFrom('school_domains')
        .where('domainId', '=', domainId)
        .execute();

    return Response.json({ success: true });
  }, {
    body: t.Object({
        domainId: t.Number()
    })
  });

export default app;
