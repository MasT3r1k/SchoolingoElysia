import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import { rateLimit } from 'elysia-rate-limit'
import { app } from '../../../../../index';
import { format_people_by_ids } from '../../../../functions/format_person_by_ids';

const elysiaAp = new Elysia()
  .use(rateLimit({
    scoping: "scoped",
    max: 10,
    duration: 1000,
    injectServer: () => app.server
  }))
  .get('/teachers', async({ query }) => {
    const result = await db.selectFrom('teachers')
      .innerJoin('persons', 'teachers.personId', 'persons.personId')
      .select([
          'teachers.personId',
          'persons.firstName',
          'persons.lastName'
      ])
      .orderBy('personId', 'asc')
      .execute();

    const teacher_names = await format_people_by_ids(result.map((teacher) => (teacher.personId)));
    const teachers = result.map((teacher, index) => ({
        teacherId: teacher.personId,
        teacherName: teacher_names[index],
        firstName: teacher.firstName,
        lastName: teacher.lastName,
    })).sort((a, b) => {
        const ln = a.lastName.localeCompare(b.lastName, 'cs');
        if (ln !== 0) return ln;
        return a.firstName.localeCompare(b.firstName, 'cs');
    });

    return Response.json(teachers);

});


export default elysiaAp;
