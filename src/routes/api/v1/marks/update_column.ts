import { Elysia, t } from 'elysia';
import moment from 'moment';
import { db } from '../../../../../database';

const app = new Elysia().post(
  '/marks/update_column',
  async ({ cookie, body }) => {
    const token = cookie.token?.value as string;
    const { group_id, subject_id, columnIndex, weight, type, topic } = body;

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

    if (group_id == undefined || isNaN(group_id))
      return Response.json({ error: 'invalid_group_id' });
    if (subject_id == undefined || isNaN(subject_id))
      return Response.json({ error: 'invalid_subject_id' });
    if (columnIndex == undefined || isNaN(columnIndex))
      return Response.json({ error: 'invalid_column_index' });
    if (weight == undefined || isNaN(weight)) return Response.json({ error: 'invalid_weight' });
    if (type == undefined || isNaN(type)) return Response.json({ error: 'invalid_type' });
    if (topic == undefined) return Response.json({ error: 'invalid_topic' });

    // Check subject
    const subject = await db
      .selectFrom('subjects')
      .select(['subjectId'])
      .where('subjectId', '=', subject_id)
      .limit(1)
      .execute();

    if (!subject.length) {
      return Response.json({ error: 'invalid_subject_id' });
    }

    // Zkontroluj, zda už existuje sloupec
    const existingColumn = await db
      .selectFrom('grades_columns')
      .select('gcId')
      .where('groupId', '=', group_id)
      .where('subjectId', '=', subject_id)
      .where('columnIndex', '=', columnIndex)
      .limit(1)
      .executeTakeFirst();

    if (existingColumn) {
      // UPDATE existujícího
      await db
        .updateTable('grades_columns')
        .set({
          weight,
          type,
          topic,
          status: 'active',
        })
        .where('gcId', '=', existingColumn.gcId)
        .execute();

      return Response.json(
        {
          data:
          {
            group_id,
            subject_id,
            columnIndex,
            weight,
            type,
            topic
          },
          status: 'updated'
        }
      );
    } else {
      // INSERT nového
      await db
        .insertInto('grades_columns')
        .values({
          groupId: group_id,
          subjectId: subject_id,
          columnIndex,
          weight,
          type,
          topic,
          status: 'active',
        })
        .execute();

      return Response.json(
        {
          data:
          {
            group_id,
            subject_id,
            columnIndex,
            weight,
            type,
            topic
          },
          status: 'created'
        }
      );
    }
  },
  {
    body: t.Object({
      group_id: t.Optional(t.Number()),
      subject_id: t.Optional(t.Number()),
      columnIndex: t.Optional(t.Number()),
      weight: t.Optional(t.Number()),
      type: t.Optional(t.Number()),
      topic: t.Optional(t.String()),
    }),
  }
);

export default app;
