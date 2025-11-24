import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';

const app = new Elysia()
  .post('/system/update_scope', async ({ cookie, body }) => {
    const token = cookie.token?.value;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.userId', 'tokens.userId')
      .select(['tokens.tokenId', 'tokens.userId', 'users.person', 'users.manager', 'users.principal'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth?.person) return { error: 'no_user', details: 'no_db' };

    // === Check permissions ===
    if (auth.manager != -1 && auth.principal == false) return { error: 'no_permission' };

    // === Check school ===
    const school = await db.selectFrom('schools')
    .select([
        'schoolId'
    ])
    .executeTakeFirst();
    if (!school) return { error: 'invalid_school' };

    // === Get Body ===
    const { scopeId, name, shortcut, code, years, students_per_class, number_of_classes, subjects } = body;

    try {
      let subjects_sql_builder: any = [];
      let realScopeId = scopeId;

      if (scopeId == null) {
        const newScope = await db.insertInto('scopes')
        .values({
          name,
          shortcut,
          code,
          years,
          students_per_class,
          number_of_classes
        })
        .executeTakeFirst();

        realScopeId = Number(newScope.insertId);

        // === Format SQL builder from subjects hours ===
        Object.entries(subjects).forEach(([subjectId, years]) => {
          years.forEach((hours: number, index: number) => {
            subjects_sql_builder.push({
              scope_id: Number(newScope.insertId),
              year: index,
              subject_id: subjectId,
              hours_per_week: hours
            });
          })
        })

        // === Insert scope subjects ===
        await db.insertInto('scopes_subjects')
        .values(subjects_sql_builder)
        .execute();
      } else {
        // === Check if scope is valid ===
        const scope = await db.selectFrom('scopes')
        .select([
          'scopes.scopeId'
        ])
        .where('scopes.scopeId', '=', scopeId)
        .executeTakeFirst();

        if (!scope) return { error: 'invalid_scope' };
        
        const updateScopes = await db.updateTable('scopes')
        .set({
          name,
          shortcut,
          code,
          years,
          students_per_class,
          number_of_classes
        })
        .where('scopes.scopeId', '=', scopeId)
        .executeTakeFirst();

        // === Update subjects ===
        await db.deleteFrom('scopes_subjects')
        .where('scope_id', '=', scopeId)
        .execute();

        let subjects_sql_builder: any = [];
        // === Format SQL builder from subjects hours ===
        Object.entries(subjects).forEach(([subjectId, years]) => {
          years.forEach((hours: number, index: number) => {
            subjects_sql_builder.push({
              scope_id: scopeId,
              year: index,
              subject_id: subjectId,
              hours_per_week: hours
            });
          })
        })

        // === Insert scope subjects ===
        await db.insertInto('scopes_subjects')
        .values(subjects_sql_builder)
        .execute();
      }

      return { success: true, scopeId: realScopeId }
    } catch(e) {
      return { success: false }
    }
  }, {
    body: t.Object({
        scopeId: t.Nullable(t.Number()),
        name: t.String(),
        shortcut: t.String(),
        code: t.String(),
        years: t.Number(),
        students_per_class: t.Number(),
        number_of_classes: t.Number(),
        subjects: t.Record(t.Number(), t.Array(t.Number()))
    })
   });

export default app;
