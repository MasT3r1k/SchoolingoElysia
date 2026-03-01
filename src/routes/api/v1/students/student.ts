import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import { sql } from 'kysely';
import moment from 'moment';
import { format_person_by_id } from '../../../../functions/format_person_by_id';
import { format_person_map_by_ids } from '../../../../functions/format_person_by_ids';
import { auth } from '../../../../middleware/auth.middleware';
import { GlobalPermissions } from '../../../../config/permissions.config';
import { permissions } from '../../../../middleware/permission.middleware';
import { getAuthUser } from '../../../../utils/auth';
import { PermissionService } from '../../../../functions/permission.service';

/* ---------------- ENDPOINT ---------------- */

const elysiaApp = new Elysia()
  .get('/student/parent/search', async ({ cookie, query: { q } }) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return;
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.STUDENT_EDIT);
    if (!perm) {
      return { error: 'no_permission' };
    }
    if (!q || q.length < 3) return [];

    return await db.selectFrom('persons')
      .select([
        'person_id as personId',
        'first_name as firstName',
        'last_name as lastName',
        'birthday'
      ])
      .where(sql<boolean>`(
        first_name LIKE ${`%${q}%`} 
        OR last_name LIKE ${`%${q}%`} 
        OR concat(first_name, ' ', last_name) LIKE ${`%${q}%`}
        OR concat(last_name, ' ', first_name) LIKE ${`%${q}%`}
      )`)
      .limit(10)
      .execute();

  }, {
    query: t.Object({
      q: t.String()
    })
  })
  .get('/student/:id', async ({ params: { id }, query, cookie }) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.STUDENT_VIEW);
    if (!perm) {
      return { error: 'no_permission' };
    }
    try {
      const time = moment(query.time);
      const show = query.type.split(',');

      const results = await Promise.all([
        db.selectFrom('students')
          .leftJoin('persons', 'students.person_id', 'persons.person_id')
          .leftJoin('classes', 'students.class_id', 'classes.class_id')
          .leftJoin('insurance_companies', 'insurance_companies.insurance_id', 'persons.insurance_id')
          .leftJoin('school_years', 'school_years.sy_id', 'classes.year_id')
          .leftJoin('scopes', 'scopes.scope_id', 'classes.scope_id')
          .leftJoin('addresses', 'persons.address_id', 'addresses.address_id')
          .leftJoin('cities', 'addresses.city_id', 'cities.city_id')
          .select([
            'persons.person_id',
            'persons.first_name',
            'persons.last_name',
            'persons.gender',
            'persons.birthday',
            'persons.birthnum',
            'persons.nationality_id',
            sql<string>`(SELECT nationality FROM countries WHERE country_id = persons.nationality_id)`.as('nationality'),
            sql<string>`(SELECT code2 FROM countries WHERE country_id = persons.nationality_id)`.as('nationality_code2'),
            sql<string>`(SELECT city_name FROM cities WHERE city_id = persons.birthplace_id)`.as('birth_place'),
            'students.status',
            'students.class_id',

            sql<string>`(
              SELECT GROUP_CONCAT(d.shortcut ORDER BY d.weight SEPARATOR ', ')
              FROM degrees d
              INNER JOIN persons_degree pd ON d.degree_id = pd.degree_id
              WHERE pd.person_id = persons.person_id AND d.is_before = 1
            )`.as('prefix_title'),
            sql<string>`(
              SELECT GROUP_CONCAT(d.shortcut ORDER BY d.weight SEPARATOR ', ')
              FROM degrees d
              INNER JOIN persons_degree pd ON d.degree_id = pd.degree_id
              WHERE pd.person_id = persons.person_id AND d.is_before = 0
            )`.as('suffix_title'),
            sql`students.start_study`.as('start_study'),


            sql`concat(
              classes.prefix,
              TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1,
              classes.suffix
            )`.as('class_name'),
            'insurance_companies.insurance_id',
            sql`insurance_companies.insurance`.as('insurance_name'),
            sql`insurance_companies.shortcut`.as('insurance_short'),
            sql<number>`TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1`.as('year'),
            'classes.scope_id',
            'classes.teacher_id',
            sql<string>`scopes.name`.as('field_of_study'),
            'addresses.address_id',
            'addresses.street',
            'addresses.house_number',
            'cities.city_id',
            'cities.city_name as city_name',
            'cities.postcode',
            sql<string>`(
              SELECT email 
              FROM emails 
              WHERE emails.person_id = persons.person_id 
              AND emails.is_verified = 1 
              LIMIT 1
            )`.as('email'),

            sql<string>`(
              SELECT number 
              FROM phone_numbers 
              WHERE phone_numbers.person_id = persons.person_id 
              AND phone_numbers.is_verified = 1 
              LIMIT 1
            )`.as('phone'),

            sql<number>`(
              SELECT ROUND(
                SUM(g.mark * gc.weight) / NULLIF(SUM(gc.weight), 0),
                2
              )
              FROM grades g
              LEFT JOIN grades_columns gc ON gc.column_id = g.column_id
              WHERE g.student_id = students.person_id
              AND gc.status = 'active'
              AND g.mark IS NOT NULL
            )`.as('average_grade'),

            sql<number>`(
              SELECT COUNT(*)
              FROM education_measures
              WHERE student_id = students.person_id
              AND status = 'approved'
            )`.as('education_measures_count'),

            sql<number>`(
              SELECT ROUND(
                CASE 
                  WHEN COUNT(DISTINCT c.classbook_id) = 0 THEN 0
                  ELSE (COUNT(a.student_id) * 100.0) / COUNT(DISTINCT c.classbook_id)
                END,
                2
              )
              FROM student_groups sg
              LEFT JOIN classbook c ON c.group_id = sg.group_id
              LEFT JOIN absence a 
                ON a.lesson_id = c.classbook_id 
                AND a.student_id = students.person_id
              WHERE sg.student_id = students.person_id
            )`.as('absence_rate'),

            sql<number>`(
              SELECT ROUND(
                CASE 
                  WHEN COUNT(DISTINCT c.classbook_id) = 0 THEN 0
                  ELSE (COUNT(CASE WHEN a.type != 2 THEN a.student_id END) * 100.0) / COUNT(DISTINCT c.classbook_id)
                END,
                2
              )
              FROM student_groups sg
              LEFT JOIN classbook c ON c.group_id = sg.group_id
              LEFT JOIN absence a 
                ON a.lesson_id = c.classbook_id 
                AND a.student_id = students.person_id
              WHERE sg.student_id = students.person_id
            )`.as('absence_rate_excused'),

            sql<number>`(
              SELECT ROUND(
                CASE 
                  WHEN COUNT(DISTINCT c.classbook_id) = 0 THEN 0
                  ELSE (COUNT(CASE WHEN a.type = 2 THEN a.student_id END) * 100.0) / COUNT(DISTINCT c.classbook_id)
                END,
                2
              )
              FROM student_groups sg
              LEFT JOIN classbook c ON c.group_id = sg.group_id
              LEFT JOIN absence a 
                ON a.lesson_id = c.classbook_id 
                AND a.student_id = students.person_id
              WHERE sg.student_id = students.person_id
            )`.as('absence_rate_unexcused')
          ])
          .where('persons.person_id', '=', id)
          .executeTakeFirstOrThrow(),

        db.selectFrom('student_groups')
          .innerJoin('groups', 'student_groups.group_id', 'groups.group_id')
          .innerJoin('school_years as sy', 'groups.year_id', 'sy.sy_id')
          .select([
            'groups.group_id',
            'groups.name',
            'groups.num',
          ])
          .where('student_groups.student_id', '=', id)
          .where(sql<boolean>`sy.start <= ${time.format("YYYY-MM-DD")}`)
          .where(sql<boolean>`sy.end >= ${time.format("YYYY-MM-DD")}`)
          .execute(),

        db.selectFrom('family_relations')
          .leftJoin('persons', 'family_relations.target_id', 'persons.person_id')
          .select([
            'persons.person_id as id',
            'persons.first_name as firstName',
            'persons.last_name as lastName',
            'family_relations.role as relationship',
            sql<string>`(
              SELECT email 
              FROM emails 
              WHERE emails.person_id = persons.person_id 
              LIMIT 1
            )`.as('email'),
            sql<string>`(
              SELECT number 
              FROM phone_numbers 
              WHERE phone_numbers.person_id = persons.person_id 
              LIMIT 1
            )`.as('phone')
          ])
          .where('family_relations.source_id', '=', id)
          .execute(),


        db.selectFrom('grades')
          .innerJoin('grades_columns', 'grades.column_id', 'grades_columns.column_id')
          .innerJoin('subjects', 'grades_columns.subject_id', 'subjects.subject_id')
          .leftJoin('persons as teacher', 'teacher.person_id', 'grades.teacher_id')
          .select([
            'grades.mark',
            'grades.column_id',
            'grades_columns.weight',
            'grades_columns.topic',
            'grades_columns.created',
            'grades_columns.type',
            'grades_columns.max_points',
            'grades_columns.subject_id',
            'grades_columns.group_id',
            'subjects.shortcut as subject_shortcut',
            'subjects.label as subject_name',
            'teacher.last_name as teacher_last_name',
            'teacher.first_name as teacher_first_name'
          ])
          .where('grades.student_id', '=', id)
          .where('grades_columns.status', '=', 'active')
          .orderBy('grades_columns.created', 'desc')
          .limit(5)
          .execute(),

        db.selectFrom('absence')
          .innerJoin('classbook', 'absence.lesson_id', 'classbook.classbook_id')
          .innerJoin('subjects', 'classbook.subject_id', 'subjects.subject_id')
          .select([
            'classbook.date',
            'classbook.day_hour',
            'subjects.shortcut as subject_shortcut',
            'absence.type',
            'absence.minutes',
            'absence.reason'
          ])
          .where('absence.student_id', '=', id)
          .orderBy('classbook.date', 'desc')
          .orderBy('classbook.day_hour', 'desc')
          .limit(5)
          .execute()
      ]);

      const [studentResult, groups, parents, lastGrades, recentAbsences] = results as [any, any[], any[], any[], any[]];


      const groupIds = groups.length ? groups.map(g => g.group_id) : [-1];

      const [timetableResult, substitutionResult] = await Promise.all([
        db.selectFrom('timetable')
          .innerJoin('subjects', 'timetable.subject_id', 'subjects.subject_id')
          .leftJoin('persons', 'timetable.teacher_id', 'persons.person_id')
          .select([
            sql`(timetable.day + 1) % 7`.as('day'),
            'timetable.hour',
            'timetable.type',
            sql`subjects.label`.as('subject_name'),
            sql`subjects.shortcut`.as('subject_shortcut'),
            'persons.person_id as teacher_id'
          ])
          .where('timetable.group_id', 'in', groupIds)
          .execute(),

        db.selectFrom('substitution')
          .leftJoin('subjects', 'substitution.subject_id', 'subjects.subject_id')
          .leftJoin('persons', 'substitution.teacher_id', 'persons.person_id')
          .select([
            'substitution.start_date',
            'substitution.start_hour',
            'substitution.end_date',
            'substitution.end_hour',
            sql`subjects.label`.as('subject_name'),
            sql`subjects.shortcut`.as('subject_shortcut'),
            'persons.person_id as teacher_id'
          ])
          .where('substitution.group_id', 'in', groupIds)
          .where(sql<boolean>`substitution.start_date >= ${time.clone().startOf('isoWeek').format("YYYY-MM-DD")}`)
          .where(sql<boolean>`substitution.end_date <= ${time.clone().endOf('isoWeek').format("YYYY-MM-DD")}`)
          .execute()
      ]);

      const teacherIds = [
        ...timetableResult.map(t => t.teacher_id).filter((id): id is number => id !== null),
        ...substitutionResult.map(s => s.teacher_id).filter((id): id is number => id !== null)
      ];
      const teacherNameMap = await format_person_map_by_ids(teacherIds);

      const timetable = timetableResult.map(t => ({
        ...t,
        teacher: t.teacher_id ? teacherNameMap.get(t.teacher_id) : ''
      }));

      const substitution = substitutionResult.map(s => ({
        ...s,
        teacher: s.teacher_id ? teacherNameMap.get(s.teacher_id) : ''
      }));

      const result: any = {};

      if (show.includes('basic')) {
        Object.assign(result, studentResult);
        if (studentResult.person_id) {
          result.full_name = await format_person_by_id(studentResult.person_id);
        }
        result.last_grades = lastGrades;
        result.recent_absences = recentAbsences;
      }
      if (show.includes('groups')) result.groups = groups;
      if (show.includes('parents')) {
        const parentNames = await format_person_map_by_ids(parents.map((parent) => (parent.id)));
        result.parents = parents.map((parent) => ({ ...parent, fullName: parentNames.get(parent.id) }));
      }
      if (show.includes('timetable')) {
        result.timetable = timetable;
        result.substitution = substitution;
      }
      if (show.includes('medical')) {
        result.medical_records = await db.selectFrom('student_medical_records')
          .selectAll()
          .where('student_id', '=', id)
          .orderBy('created_at', 'desc')
          .execute();
      }

      if (show.includes('matrika')) {
        result.matrika = await db.selectFrom('student_matrika')
          .selectAll()
          .where('student_id', '=', id)
          .executeTakeFirst() || {
          student_id: id,
          highest_education_id: null,
          previous_school_izo: null,
          study_type_code: null,
          financing_code: null,
          start_reason_code: null,
          end_reason_code: null,
          individual_plan_code: null,
          special_needs_code: null,
          language_code: null,
          health_status_code: null
        };

        result.matrika_records = await db.selectFrom('student_matrika_records')
          .selectAll()
          .where('student_id', '=', id)
          .orderBy('created_at', 'desc')
          .execute();
      }

      if (studentResult.teacher_id) {
        result.teacher_name = await format_person_by_id(studentResult.teacher_id);
      }

      if (show.includes('notes')) {
        const notes = await db.selectFrom('student_notes')
          .selectAll()
          .where('student_id', '=', id)
          .orderBy('created_at', 'desc')
          .execute();

        const teacherIds = notes.map(n => n.teacher_id);
        const teacherMap = await format_person_map_by_ids(teacherIds);

        result.student_notes = notes.map(n => ({
          ...n,
          teacher_name: teacherMap.get(n.teacher_id)
        }));
      }

      return Response.json(result);

    } catch (e) {
      console.error(e);
      return new Response(JSON.stringify({ error: 'Student not found' }), { status: 404 });
    }
  }, {
    params: t.Object({
      id: t.Number()
    }),
    query: t.Object({
      type: t.String({ default: 'basic,groups,timetable,parents,medical,matrika,notes' }),
      time: t.String({ default: moment().format("YYYY-MM-DD") })
    })
  })

  .patch('/student/:id/matrika', async ({ params: { id }, body, cookie }) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.STUDENT_EDIT);
    if (!perm) return { error: 'no_permission' };

    try {
      const exists = await db.selectFrom('student_matrika')
        .select('student_id')
        .where('student_id', '=', id)
        .executeTakeFirst();

      if (exists) {
        await db.updateTable('student_matrika')
          .set({
            highest_education_id: body.highest_education_id,
            previous_school_izo: body.previous_school_izo,
            study_type_code: body.study_type_code,
            financing_code: body.financing_code,
            start_reason_code: body.start_reason_code,
            end_reason_code: body.end_reason_code,
            individual_plan_code: body.individual_plan_code,
            special_needs_code: body.special_needs_code,
            language_code: body.language_code,
            health_status_code: body.health_status_code,
            updated_at: new Date()
          })
          .where('student_id', '=', id)
          .execute();
      } else {
        await db.insertInto('student_matrika')
          .values({
            student_id: id,
            highest_education_id: body.highest_education_id,
            previous_school_izo: body.previous_school_izo,
            study_type_code: body.study_type_code,
            financing_code: body.financing_code,
            start_reason_code: body.start_reason_code,
            end_reason_code: body.end_reason_code,
            individual_plan_code: body.individual_plan_code,
            special_needs_code: body.special_needs_code,
            language_code: body.language_code,
            health_status_code: body.health_status_code
          })
          .execute();
      }

      if (body.saveType === 'change') {
        await db.insertInto('student_history')
          .values({
            student_id: id,
            teacher_id: user.person_id as number,
            type: 'updated_matrika',
            data: JSON.stringify(body)
          })
          .execute();
      }

      return { success: true };
    } catch (e) {
      console.error(e);
      return new Response(JSON.stringify({ error: 'Failed to update matrika' }), { status: 500 });
    }
  }, {
    params: t.Object({
      id: t.Number()
    }),
    body: t.Object({
      highest_education_id: t.Optional(t.Nullable(t.Number())),
      previous_school_izo: t.Optional(t.Nullable(t.String())),
      study_type_code: t.Optional(t.Nullable(t.String())),
      financing_code: t.Optional(t.Nullable(t.String())),
      start_reason_code: t.Optional(t.Nullable(t.String())),
      end_reason_code: t.Optional(t.Nullable(t.String())),
      individual_plan_code: t.Optional(t.Nullable(t.String())),
      special_needs_code: t.Optional(t.Nullable(t.String())),
      language_code: t.Optional(t.Nullable(t.String())),
      health_status_code: t.Optional(t.Nullable(t.String())),
      saveType: t.Optional(t.Union([t.Literal('change'), t.Literal('correction')], { default: 'correction' })),
      changes: t.Optional(t.Array(t.Object({
        label: t.String(),
        oldValue: t.Any(),
        newValue: t.Any()
      })))
    })
  })

  .post('/student/:id/matrika/record', async ({ params: { id }, body, cookie }) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.STUDENT_EDIT);
    if (!perm) return { error: 'no_permission' };

    try {
      await db.insertInto('student_matrika_records')
        .values({
          student_id: id,
          type: body.type,
          description: body.description,
          valid_from: body.valid_from,
          valid_to: body.valid_to
        })
        .execute();
      return { success: true };
    } catch (e) {
      console.error(e);
      return new Response(JSON.stringify({ error: 'Failed' }), { status: 500 });
    }
  }, {
    params: t.Object({ id: t.Number() }),
    body: t.Object({
      type: t.String(),
      description: t.Optional(t.Nullable(t.String())),
      valid_from: t.Optional(t.Nullable(t.String())),
      valid_to: t.Optional(t.Nullable(t.String()))
    })
  })

  .delete('/student/:id/matrika/record/:record', async ({ params, cookie }) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.STUDENT_EDIT);
    if (!perm) return { error: 'no_permission' };

    try {
      await db.deleteFrom('student_matrika_records')
        .where('student_id', '=', params.id)
        .where('id', '=', params.record)
        .execute();
      return { success: true };
    } catch (e) {
      console.error(e);
      return new Response(JSON.stringify({ error: 'Failed' }), { status: 500 });
    }
  }, {
    params: t.Object({
      id: t.Number(),
      record: t.Number()
    })
  })

  .get('/student/:id/medical', async ({ cookie, params: { id } }) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return;
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.STUDENT_VIEW);
    if (!perm) {
      return { error: 'no_permission' };
    }
    return await db.selectFrom('student_medical_records')
      .selectAll()
      .where('student_id', '=', id)
      .orderBy('created_at', 'desc')
      .execute();
  }, {
    params: t.Object({
      id: t.Number()
    })
  })

  .post('/student/:id/medical', async ({ params: { id }, body, cookie }) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return;
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.STUDENT_EDIT);
    if (!perm) {
      return { error: 'no_permission' };
    }
    try {
      const result = await db.insertInto('student_medical_records')
        .values({
          student_id: id,
          type: body.type,
          title: body.title,
          description: body.description || null,
          severity: body.severity as any,
          is_food_allergy: !!body.is_food_allergy,
          allergen_codes: body.allergen_codes || null
        })

        .executeTakeFirstOrThrow();

      return { success: true, recordId: Number(result.insertId) };
    } catch (e) {
      console.error(e);
      return new Response(JSON.stringify({ error: 'Failed to add medical record' }), { status: 500 });
    }
  }, {
    params: t.Object({
      id: t.Number()
    }),
    body: t.Object({
      type: t.String(),
      title: t.String(),
      description: t.Optional(t.String()),
      severity: t.Union([t.Literal('low'), t.Literal('medium'), t.Literal('high')]),
      is_food_allergy: t.Optional(t.Boolean()),
      allergen_codes: t.Optional(t.String())
    })
  })

  .patch('/student/:id/medical/:recordId', async ({ cookie, params: { id, recordId }, body }) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return;
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.STUDENT_EDIT);
    if (!perm) {
      return { error: 'no_permission' };
    }
    try {
      await db.updateTable('student_medical_records')
        .set({
          type: body.type,
          title: body.title,
          description: body.description || null,
          severity: body.severity as any,
          is_food_allergy: !!body.is_food_allergy,
          allergen_codes: body.allergen_codes || null

        })
        .where('record_id', '=', recordId)
        .where('student_id', '=', id)
        .execute();

      return { success: true };
    } catch (e) {
      console.error(e);
      return new Response(JSON.stringify({ error: 'Failed to update medical record' }), { status: 500 });
    }
  }, {
    params: t.Object({
      id: t.Number(),
      recordId: t.Number()
    }),
    body: t.Object({
      type: t.String(),
      title: t.String(),
      description: t.Optional(t.String()),
      severity: t.Union([t.Literal('low'), t.Literal('medium'), t.Literal('high')]),
      is_food_allergy: t.Optional(t.Boolean()),
      allergen_codes: t.Optional(t.String())
    })
  })

  .delete('/student/:id/medical/:recordId', async ({ cookie, params: { id, recordId } }) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return;
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.STUDENT_EDIT);
    if (!perm) {
      return { error: 'no_permission' };
    }
    try {
      await db.deleteFrom('student_medical_records')
        .where('record_id', '=', recordId)
        .where('student_id', '=', id)
        .execute();

      return { success: true };
    } catch (e) {
      console.error(e);
      return new Response(JSON.stringify({ error: 'Failed to delete medical record' }), { status: 500 });
    }
  }, {
    params: t.Object({
      id: t.Number(),
      recordId: t.Number()
    })
  })

  .post('/student/:id/parent', async ({ cookie, params: { id }, body }) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return;
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.STUDENT_EDIT);
    if (!perm) {
      return { error: 'no_permission' };
    }
    // @ts-ignore
    const { mode, role, personId, firstName, lastName, gender, prefixTitle, suffixTitle, email, phone, address } = body;


    try {
      if (mode === 'existing') {
        if (!personId) throw new Error('Person ID is required for existing mode');

        await db.insertInto('family_relations')
          .values({
            source_id: id,
            target_id: personId,
            // @ts-ignore
            role: role
          })
          .execute();

        return { success: true };

      } else if (mode === 'new') {
        if (!firstName || !lastName) throw new Error('First name and last name are required');

        const result = await db.transaction().execute(async (trx) => {
          const newPerson = await trx.insertInto('persons')
            .values({
              first_name: firstName,
              last_name: lastName,
              gender: gender ?? 0
            })
            .executeTakeFirstOrThrow();

          const newPersonId = Number(newPerson.insertId);

          // Handle titles
          const allTitles = [
            ...(prefixTitle || '').split(',').map((s: string) => s.trim()),
            ...(suffixTitle || '').split(',').map((s: string) => s.trim())
          ].filter(s => s.length > 0);

          if (allTitles.length > 0) {
            const degrees = await trx.selectFrom('degrees')
              .select(['degree_id', 'shortcut'])
              .where('shortcut', 'in', allTitles)
              .execute();

            if (degrees.length > 0) {
              await trx.insertInto('persons_degree')
                .values(degrees.map(d => ({
                  person_id: newPersonId,
                  degree_id: d.degree_id
                })))
                .execute();
            }
          }

          // Handle address
          if (address && address.city && address.street) {
            let cityId: number;
            const existingCity = await trx.selectFrom('cities')
              .select('city_id')
              .where('city_name', '=', address.city)
              .where('postcode', '=', address.postcode || null)
              .executeTakeFirst();

            if (existingCity) {
              cityId = existingCity.city_id;
            } else {
              const newCity = await trx.insertInto('cities')
                .values({
                  city_name: address.city,
                  postcode: address.postcode || null,
                  country_id: 1
                })
                .executeTakeFirstOrThrow();
              cityId = Number(newCity.insertId);
            }

            const newAddress = await trx.insertInto('addresses')
              .values({
                city_id: cityId,
                street: address.street,
                house_number: address.houseNumber
              })
              .executeTakeFirstOrThrow();
            const addressId = Number(newAddress.insertId);

            await trx.updateTable('persons')
              .set({ address_id: addressId })
              .where('person_id', '=', newPersonId)
              .execute();
          }

          await trx.insertInto('family_relations')
            .values({
              source_id: id,
              target_id: newPersonId,
              // @ts-ignore
              role: role
            })
            .execute();


          if (email) {
            await trx.insertInto('emails')
              .values({
                person_id: newPersonId,
                email,
                type: 'personal',
                is_verified: false
              })
              .execute();
          }

          if (phone) {
            await trx.insertInto('phone_numbers')
              .values({
                person_id: newPersonId,
                number: phone,
                is_verified: false,
                code: 420 // Default czech prefix
              })
              .execute();
          }

          return { success: true, personId: newPersonId };

        });

        return result;
      }

      throw new Error('Invalid mode');

    } catch (e) {
      console.error(e);
      return new Response(JSON.stringify({ error: 'Failed to add parent', details: e }), { status: 500 });
    }
  }, {
    params: t.Object({
      id: t.Number()
    }),
    body: t.Object({
      mode: t.Union([t.Literal('existing'), t.Literal('new')]),
      role: t.String(),
      personId: t.Optional(t.Number()),
      firstName: t.Optional(t.String()),
      lastName: t.Optional(t.String()),
      gender: t.Optional(t.Number()),
      prefixTitle: t.Optional(t.String()),
      suffixTitle: t.Optional(t.String()),
      email: t.Optional(t.String()),
      phone: t.Optional(t.String()),
      address: t.Optional(t.Object({
        street: t.String(),
        houseNumber: t.String(),
        city: t.String(),
        postcode: t.Optional(t.String())
      }))
    })

  })

  .patch('/student/:id/address', async ({ cookie, params: { id }, body }) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return;
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.STUDENT_EDIT);
    if (!perm) {
      return { error: 'no_permission' };
    }

    const { street, houseNumber, city, postcode } = body;

    try {
      await db.transaction().execute(async (trx) => {
        // 1. Find or create city
        let cityId: number;
        const existingCity = await trx.selectFrom('cities')
          .select('city_id')
          .where('city_name', '=', city)
          .where('postcode', '=', postcode || null)
          .executeTakeFirst();

        if (existingCity) {
          cityId = existingCity.city_id;
        } else {
          const newCity = await trx.insertInto('cities')
            .values({
              city_name: city,
              postcode: postcode || null,
              country_id: 1 // Default to Czech Republic for now, or could be passed
            })
            .executeTakeFirstOrThrow();
          cityId = Number(newCity.insertId);
        }

        // 2. Get person and their addressId
        const person = await trx.selectFrom('persons')
          .select('address_id')
          .where('person_id', '=', id)
          .executeTakeFirstOrThrow();

        if (person.address_id) {
          // Update existing address
          await trx.updateTable('addresses')
            .set({
              city_id: cityId,
              street,
              house_number: houseNumber
            })
            .where('address_id', '=', person.address_id)
            .execute();
        } else {
          // Create new address
          const newAddress = await trx.insertInto('addresses')
            .values({
              city_id: cityId,
              street,
              house_number: houseNumber
            })
            .executeTakeFirstOrThrow();
          const addressId = Number(newAddress.insertId);

          // Link to person
          await trx.updateTable('persons')
            .set({ address_id: addressId })
            .where('person_id', '=', id)
            .execute();
        }
      });

      if (body.saveType === 'change') {
        await db.insertInto('student_history')
          .values({
            student_id: id,
            teacher_id: user.person_id as number,
            type: 'updated_student',
            data: JSON.stringify(body)
          })
          .execute();
      }

      return { success: true };
    } catch (e) {
      console.error(e);
      return new Response(JSON.stringify({ error: 'Failed to update address', details: e }), { status: 500 });
    }
  }, {
    params: t.Object({
      id: t.Number()
    }),
    body: t.Object({
      street: t.String(),
      houseNumber: t.String(),
      city: t.String(),
      postcode: t.Optional(t.String()),
      saveType: t.Optional(t.Union([t.Literal('change'), t.Literal('correction')], { default: 'correction' })),
      changes: t.Optional(t.Array(t.Object({
        label: t.String(),
        oldValue: t.Any(),
        newValue: t.Any()
      })))
    })
  })

  .get('/student/:id/history', async ({ params: { id }, body, cookie }) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };

    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.STUDENT_VIEW);
    if (!perm) return { error: 'no_permission' };

    const student_id = parseInt(id);

    const history = await db.selectFrom('student_history')
      .select([
        'student_history.teacher_id',
        'student_history.type',
        'student_history.data',
        'student_history.created_at'
      ])
      .where('student_history.student_id', '=', student_id)
      .execute();

    const teacherNames = await format_person_map_by_ids(history.map((h) => h.teacher_id));

    const enrichedHistory = await Promise.all(history.map(async (h) => {
      const teacher_name = teacherNames.get(h.teacher_id);

      let dataObj: any = {};

      try {
        // 1. Ošetření divného formátu (znaky jako klíče)
        if (h.data && typeof h.data === 'object' && h.data['0']) {
          // Poskládáme string z očíslovaných klíčů
          const jsonString = Object.values(h.data).join('');
          dataObj = JSON.parse(jsonString);
        } else if (typeof h.data === 'string') {
          dataObj = JSON.parse(h.data);
        } else {
          dataObj = h.data;
        }
      } catch (e) {
        console.error("Chyba při parsování data JSONu", e);
        dataObj = h.data;
      }

      let parent_full_name = null;

      // 2. Kontrola parent_id (může to být string i number, podle toho JSONu výše je to "33")
      if (dataObj?.parent_id) {
        parent_full_name = await format_person_by_id(parseInt(dataObj.parent_id));
      }

      return {
        ...h,
        full_name: teacher_name,
        data: {
          ...dataObj,
          parent_full_name // Teď už tam bude skutečné jméno místo null
        }
      };
    }));
    return enrichedHistory;
  })

  .patch('/student/:id/personal', async ({ cookie, params: { id }, body }) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return;
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.STUDENT_EDIT);
    if (!perm) {
      return { error: 'no_permission' };
    }
    const {
      firstName, lastName, prefixTitle, suffixTitle,
      classId, insuranceId, gender, birthNum,
      birthday, birthPlace, nationalityId, saveType
    } = body;

    try {
      await db.transaction().execute(async (trx) => {
        // Parse birthday if provided
        let formattedBirthday = null;
        if (birthday) {
          const mBirthday = moment(birthday, ["YYYY-MM-DD", "DD. MM. YYYY", "DD.MM.YYYY"], true);
          if (mBirthday.isValid()) {
            formattedBirthday = mBirthday.format("YYYY-MM-DD");
          }
        }

        // Handle Birth Place (City)
        let birthplaceId = null;
        if (birthPlace && birthPlace.trim() !== '') {
          const existingCity = await trx.selectFrom('cities')
            .select('city_id')
            .where('city_name', '=', birthPlace.trim())
            .executeTakeFirst();

          if (existingCity) {
            birthplaceId = existingCity.city_id;
          } else {
            const newCity = await trx.insertInto('cities')
              .values({
                city_name: birthPlace.trim(),
                country_id: nationalityId || 1 // Use nationality as a guess for city country
              })
              .executeTakeFirstOrThrow();
            birthplaceId = Number(newCity.insertId);
          }
        }

        // 1. Update persons table
        await trx.updateTable('persons')
          .set({
            first_name: firstName,
            last_name: lastName,
            gender: gender,
            birthday: formattedBirthday,
            birthnum: (birthNum && birthNum !== '') ? birthNum : null,
            insurance_id: insuranceId,
            birthplace_id: birthplaceId,
            nationality_id: nationalityId
          })
          .where('person_id', '=', id)
          .execute();


        // 2. Update students table (class_id)
        if (classId) {
          await trx.updateTable('students')
            .set({ class_id: classId })
            .where('person_id', '=', id)
            .execute();
        }

        // 3. Handle titles (degrees)
        // Clear existing
        await trx.deleteFrom('persons_degree')
          .where('person_id', '=', id)
          .execute();

        // Find and add new degrees
        const allTitles = [
          ...(prefixTitle || '').split(',').map(s => s.trim()),
          ...(suffixTitle || '').split(',').map(s => s.trim())
        ].filter(s => s.length > 0);

        if (allTitles.length > 0) {
          const degrees = await trx.selectFrom('degrees')
            .select(['degree_id', 'shortcut'])
            .where('shortcut', 'in', allTitles)
            .execute();

          if (degrees.length > 0) {
            await trx.insertInto('persons_degree')
              .values(degrees.map(d => ({
                person_id: id,
                degree_id: d.degree_id
              })))
              .execute();
          }
        }
      });

      if (body.saveType === 'change') {
        await db.insertInto('student_history')
          .values({
            student_id: id,
            teacher_id: user.person_id as number,
            type: 'updated_student',
            data: JSON.stringify({
              ...body,
              firstName, lastName, classId, gender, birthNum, birthday, birthPlace, nationalityId, insuranceId
            })
          })
          .execute();
      }

      return { success: true };
    } catch (e) {
      console.error(e);
      return new Response(JSON.stringify({ error: 'Failed to update personal data', details: e }), { status: 500 });
    }
  }, {
    params: t.Object({
      id: t.Number()
    }),
    body: t.Object({
      firstName: t.String(),
      lastName: t.String(),
      prefixTitle: t.Optional(t.String()),
      suffixTitle: t.Optional(t.String()),
      classId: t.Optional(t.Number()),
      insuranceId: t.Optional(t.Union([t.Number(), t.Null()])),
      gender: t.Optional(t.Number()),
      birthNum: t.Optional(t.String()),
      birthday: t.Optional(t.String()),
      birthPlace: t.Optional(t.String()),
      nationalityId: t.Optional(t.Number()),
      saveType: t.Optional(t.Union([t.Literal('change'), t.Literal('correction')], { default: 'correction' })),
      changes: t.Optional(t.Array(t.Object({
        label: t.String(),
        oldValue: t.Any(),
        newValue: t.Any()
      })))
    })
  })

  // STUDENT NOTES
  .get('/student/:id/notes', async ({ cookie, params: { id } }) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return;
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.STUDENT_VIEW);
    if (!perm) return { error: 'no_permission' };

    const notes = await db.selectFrom('student_notes')
      .selectAll()
      .where('student_id', '=', id)
      .orderBy('created_at', 'desc')
      .execute();

    const teacherIds = notes.map(n => n.teacher_id);
    const teacherMap = await format_person_map_by_ids(teacherIds);

    return notes.map(n => ({
      ...n,
      teacher_name: teacherMap.get(n.teacher_id)
    }));
  }, {
    params: t.Object({ id: t.Number() })
  })

  .post('/student/:id/notes', async ({ cookie, params: { id }, body }) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return;
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.STUDENT_EDIT);
    if (!perm) return { error: 'no_permission' };

    try {
      const result = await db.insertInto('student_notes')
        .values({
          student_id: id,
          teacher_id: user.person_id as number,
          content: body.content,
          is_public: body.is_public ?? false,
          created_at: new Date(),
          updated_at: new Date()
        })
        .executeTakeFirstOrThrow();

      return { success: true, noteId: Number(result.insertId) };
    } catch (e) {
      console.error(e);
      return new Response(JSON.stringify({ error: 'Failed' }), { status: 500 });
    }
  }, {
    params: t.Object({ id: t.Number() }),
    body: t.Object({
      content: t.String(),
      is_public: t.Optional(t.Boolean())
    })
  })

  .patch('/student/:id/notes/:noteId', async ({ cookie, params: { id, noteId }, body }) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return;
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.STUDENT_EDIT);
    if (!perm) return { error: 'no_permission' };

    try {
      await db.updateTable('student_notes')
        .set({
          content: body.content,
          is_public: body.is_public ?? false,
          updated_at: new Date()
        })
        .where('note_id', '=', noteId)
        .where('student_id', '=', id)
        .execute();

      return { success: true };
    } catch (e) {
      console.error(e);
      return new Response(JSON.stringify({ error: 'Failed' }), { status: 500 });
    }
  }, {
    params: t.Object({
      id: t.Number(),
      noteId: t.Number()
    }),
    body: t.Object({
      content: t.String(),
      is_public: t.Optional(t.Boolean())
    })
  })

  .delete('/student/:id/notes/:noteId', async ({ cookie, params: { id, noteId } }) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return;
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.STUDENT_EDIT);
    if (!perm) return { error: 'no_permission' };

    try {
      await db.deleteFrom('student_notes')
        .where('note_id', '=', noteId)
        .where('student_id', '=', id)
        .execute();

      return { success: true };
    } catch (e) {
      console.error(e);
      return new Response(JSON.stringify({ error: 'Failed' }), { status: 500 });
    }
  }, {
    params: t.Object({
      id: t.Number(),
      noteId: t.Number()
    })
  });

export default elysiaApp;

