import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { getAuthUser } from '../../../../utils/auth';

const app = new Elysia()
  .derive(async ({ cookie }) => ({
      user: await getAuthUser(cookie?.token?.value)
  }))
  // POST /system/update_scope - Vytvoření/Aktualizace oboru
  .post('/system/update_scope', async ({ user, body }) => {
    if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
    if (user.manager !== -1 && !user.isPrincipal) {
      return Response.json({ error: 'no_permission' }, { status: 403 });
    }

    const { scopeId, name, shortcut, code, years, students_per_class, number_of_classes, subjects } = body;

    let finalScopeId = scopeId;

    if (scopeId === null || scopeId === undefined) {
      // Create new scope
      const result = await db.insertInto('scopes')
        .values({
          name,
          shortcut,
          code,
          years,
          students_per_class,
          number_of_classes
        })
        .executeTakeFirst();
      
      finalScopeId = Number(result.insertId);
    } else {
      // Update existing scope
      await db.updateTable('scopes')
        .set({
          name,
          shortcut,
          code,
          years,
          students_per_class,
          number_of_classes
        })
        .where('scopeId', '=', scopeId)
        .execute();
    }

    // Update subjects for scope
    if (finalScopeId && subjects && typeof subjects === 'object') {
      // Delete existing entries
      await db.deleteFrom('scopes_subjects')
        .where('scope_id', '=', finalScopeId)
        .execute();

      // Insert new entries
      const entries: { scope_id: number; subject_id: number; year: number; hours_per_week: number; exercise: number; is_mandatory: boolean }[] = [];
      
      for (const [subjectId, hoursArray] of Object.entries(subjects)) {
        if (Array.isArray(hoursArray)) {
          hoursArray.forEach((hours, yearIndex) => {
            if (hours > 0) {
              entries.push({
                scope_id: finalScopeId,
                subject_id: parseInt(subjectId),
                year: yearIndex,
                hours_per_week: hours,
                exercise: 0,
                is_mandatory: true
              });
            }
          });
        }
      }

      if (entries.length > 0) {
        await db.insertInto('scopes_subjects')
          .values(entries)
          .execute();
      }
    }

    return Response.json({ success: true, scopeId: finalScopeId });
  }, {
    body: t.Object({
      scopeId: t.Optional(t.Union([t.Number(), t.Null()])),
      name: t.String(),
      shortcut: t.String(),
      code: t.String(),
      years: t.Number(),
      students_per_class: t.Number(),
      number_of_classes: t.Number(),
      subjects: t.Optional(t.Any())
    })
  });

export default app;
