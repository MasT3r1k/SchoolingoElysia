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
            'persons.avatar',
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
            'cities.country_id',
            sql<string>`(SELECT nationality FROM countries WHERE country_id = cities.country_id)`.as('address_country'),
            sql<string>`(SELECT code2 FROM countries WHERE country_id = cities.country_id)`.as('address_country_code2'),
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
            )`.as('absence_rate_unexcused'),
            sql<number>`(
              SELECT COUNT(*) + 1
              FROM students s2
              INNER JOIN persons p2 ON s2.person_id = p2.person_id
              WHERE s2.class_id = students.class_id
              AND s2.status = 'active'
              AND (
                p2.last_name < persons.last_name
                OR (p2.last_name = persons.last_name AND p2.first_name < persons.first_name)
                OR (p2.last_name = persons.last_name AND p2.first_name = persons.first_name AND p2.person_id < persons.person_id)
              )
            )`.as('class_rank')
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
          .leftJoin('addresses', 'persons.address_id', 'addresses.address_id')
          .leftJoin('cities', 'addresses.city_id', 'cities.city_id')
          .select([
            'persons.person_id as id',
            'persons.first_name as firstName',
            'persons.last_name as lastName',
            'persons.gender',
            'family_relations.legal_guardian_de_jure',
            'family_relations.closest_legal_representative',
            'family_relations.allowed_to_receive_information',
            sql<string>`(
              SELECT GROUP_CONCAT(d.shortcut ORDER BY d.weight SEPARATOR ', ')
              FROM degrees d
              INNER JOIN persons_degree pd ON d.degree_id = pd.degree_id
              WHERE pd.person_id = persons.person_id AND d.is_before = 1
            )`.as('prefixTitle'),
            sql<string>`(
              SELECT GROUP_CONCAT(d.shortcut ORDER BY d.weight SEPARATOR ', ')
              FROM degrees d
              INNER JOIN persons_degree pd ON d.degree_id = pd.degree_id
              WHERE pd.person_id = persons.person_id AND d.is_before = 0
            )`.as('suffixTitle'),
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
            )`.as('phone'),
            'addresses.street',
            'addresses.house_number as houseNumber',
            'cities.city_name as city',
            'cities.postcode',
            'persons.data_box as dataBox'
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

        // Generate avatar if null
        if (!result.avatar) {
          const defaultAvatar = {
            collection: 'thumbs',
            options: {
              seed: result.full_name
            }
          };
          const avatarData = JSON.stringify(defaultAvatar);
          
          await db.updateTable('persons')
            .set({ avatar: avatarData })
            .where('person_id', '=', id)
            .execute();
            
          result.avatar = avatarData;
        }
        result.last_grades = lastGrades;
        result.recent_absences = recentAbsences;
      }
      if (show.includes('groups')) result.groups = groups;
      if (show.includes('parents')) {
        const parentIds = parents.map(p => p.id);
        if (parentIds.length > 0) {
          const parentNames = await format_person_map_by_ids(parentIds);
          
          // Fetch siblings for all parents at once for efficiency
          const allSiblings = await db.selectFrom('family_relations')
            .innerJoin('persons', 'family_relations.source_id', 'persons.person_id')
            .leftJoin('students', 'persons.person_id', 'students.person_id')
            .leftJoin('classes', 'students.class_id', 'classes.class_id')
            .leftJoin('school_years as sy', 'classes.year_id', 'sy.sy_id')
            .leftJoin('scopes', 'classes.scope_id', 'scopes.scope_id')
            .leftJoin('persons as teacher', 'classes.teacher_id', 'teacher.person_id')
            .select([
              'family_relations.target_id as parentId',
              'persons.person_id as id',
              'persons.first_name',
              'persons.last_name',
              'persons.gender',
              'persons.birthday',
              sql`concat(
                classes.prefix,
                TIMESTAMPDIFF(YEAR, sy.start, CURDATE()) + 1,
                classes.suffix
              )`.as('class_name'),
              sql<string>`scopes.name`.as('field_of_study'),
              'classes.teacher_id',
              sql<number>`(
                SELECT COUNT(*) + 1
                FROM students s2
                INNER JOIN persons p2 ON s2.person_id = p2.person_id
                WHERE s2.class_id = students.class_id
                AND s2.status = 'active'
                AND (
                  p2.last_name < persons.last_name
                  OR (p2.last_name = persons.last_name AND p2.first_name < persons.first_name)
                  OR (p2.last_name = persons.last_name AND p2.first_name = persons.first_name AND p2.person_id < persons.person_id)
                )
              )`.as('class_rank')
            ])
            .where('family_relations.target_id', 'in', parentIds)
            .where('family_relations.source_id', '!=', id)
            .orderBy('persons.last_name', 'asc')
            .orderBy('persons.first_name', 'asc')
            .execute();

          const siblingIdToFullName = await format_person_map_by_ids(allSiblings.map(s => s.id));
          const teacherIds = allSiblings.map(s => s.teacher_id).filter((tid): tid is number => tid !== null);
          const teacherNames = await format_person_map_by_ids(teacherIds);

          const siblingsByParent = allSiblings.map(s => ({
            ...s,
            fullName: siblingIdToFullName.get(s.id),
            teacher_name: s.teacher_id ? teacherNames.get(s.teacher_id) : ''
          }));

          result.parents = parents.map((parent) => ({ 
            ...parent, 
            fullName: parentNames.get(parent.id),
            siblings: siblingsByParent.filter(s => s.parentId == parent.id)
          }));
        } else {
          result.parents = [];
        }
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

        result.subject_exemptions = await db.selectFrom('student_subject_exemptions')
          .leftJoin('subjects', 'subjects.subject_id', 'student_subject_exemptions.subject_id')
          .select([
            'student_subject_exemptions.exemption_id',
            'student_subject_exemptions.student_id',
            'student_subject_exemptions.subject_id',
            'subjects.label as subject_name',
            'subjects.shortcut as subject_shortcut',
            'student_subject_exemptions.valid_from',
            'student_subject_exemptions.valid_to',
            'student_subject_exemptions.note',
            'student_subject_exemptions.created_at'
          ])
          .where('student_id', '=', id)
          .orderBy('student_subject_exemptions.created_at', 'desc')
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

      if (show.includes('evaluation')) {
        result.evaluations = await db.selectFrom('messages')
          .innerJoin('messages_receivers', 'messages_receivers.message_id', 'messages.message_id')
          .innerJoin('persons', 'persons.person_id', 'messages.author_id')
          .select([
            'messages.message_id',
            'messages.topic',
            'messages.message',
            'messages.sent_at',
            'messages.message_rating_type',
            'persons.first_name as teacher_first_name',
            'persons.last_name as teacher_last_name',
          ])
          .where('messages.type', '=', 3)
          .where('messages_receivers.receiver_id', '=', id)
          .orderBy('messages.sent_at', 'desc')
          .execute();
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
      type: t.String({ default: 'basic,groups,timetable,parents,medical,matrika,notes,evaluation' }),
      time: t.String({ default: moment().format("YYYY-MM-DD") })
    })
  })

  .get('/student/:id/exemptions', async ({ cookie, params: { id } }) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return;
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.STUDENT_VIEW);
    if (!perm) return { error: 'no_permission' };

    return await db.selectFrom('student_subject_exemptions')
      .leftJoin('subjects', 'subjects.subject_id', 'student_subject_exemptions.subject_id')
      .select([
        'student_subject_exemptions.exemption_id',
        'student_subject_exemptions.student_id',
        'student_subject_exemptions.subject_id',
        'subjects.label as subject_name',
        'subjects.shortcut as subject_shortcut',
        'student_subject_exemptions.valid_from',
        'student_subject_exemptions.valid_to',
        'student_subject_exemptions.note',
        'student_subject_exemptions.created_at'
      ])
      .where('student_id', '=', id)
      .orderBy('student_subject_exemptions.created_at', 'desc')
      .execute();
  }, {
    params: t.Object({ id: t.Number() })
  })

  .post('/student/:id/exemptions', async ({ cookie, params: { id }, body }) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return;
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.STUDENT_EDIT);
    if (!perm) return { error: 'no_permission' };

    try {
      await db.insertInto('student_subject_exemptions')
        .values({
          student_id: id,
          subject_id: body.subject_id,
          valid_from: body.valid_from ? new Date(body.valid_from) : null,
          valid_to: body.valid_to ? new Date(body.valid_to) : null,
          note: body.note,
          created_by: user.person_id as number
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
      subject_id: t.Number(),
      valid_from: t.Optional(t.Nullable(t.String())),
      valid_to: t.Optional(t.Nullable(t.String())),
      note: t.Optional(t.Nullable(t.String()))
    })
  })

  .delete('/student/:id/exemptions/:exemptionId', async ({ cookie, params: { id, exemptionId } }) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return;
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.STUDENT_EDIT);
    if (!perm) return { error: 'no_permission' };

    try {
      await db.deleteFrom('student_subject_exemptions')
        .where('exemption_id', '=', exemptionId)
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
      exemptionId: t.Number()
    })
  })

  .get('/student/:id/subjects', async ({ cookie, params: { id } }) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return;
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.STUDENT_VIEW);
    if (!perm) return { error: 'no_permission' };

    // Get subjects for this student (based on their class/scope)
    const studentClass = await db.selectFrom('students')
      .leftJoin('classes', 'classes.class_id', 'students.class_id')
      .leftJoin('school_years', 'school_years.sy_id', 'classes.year_id')
      .select([
        'classes.class_id',
        'classes.scope_id',
        sql<number>`TIMESTAMPDIFF(YEAR, school_years.start, CURDATE())`.as('class_index')
      ])
      .where('students.person_id', '=', id)
      .executeTakeFirst();

    if (!studentClass) return [];

    return await db.selectFrom('scopes_subjects')
      .leftJoin('subjects', 'subjects.subject_id', 'scopes_subjects.subject_id')
      .select([
        'subjects.subject_id',
        'subjects.label',
        'subjects.shortcut'
      ])
      .where('scopes_subjects.scope_id', '=', studentClass.scope_id as number)
      .where('scopes_subjects.year', '=', studentClass.class_index as number)
      .where('scopes_subjects.hours_per_week', '>=', 1)
      .orderBy('subjects.label', 'asc')
      .execute();
  }, {
    params: t.Object({ id: t.Number() })
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
    const { mode, role, personId, firstName, lastName, gender, prefixTitle, suffixTitle, email, phone, address, dataBox } = body;


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
              gender: gender ?? 0,
              data_box: dataBox || null
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
      } else if (mode === 'edit') {
        if (!personId) throw new Error('Person ID is required for edit mode');

        const result = await db.transaction().execute(async (trx) => {
          // Update person basic details
          await trx.updateTable('persons')
            .set({
              first_name: firstName,
              last_name: lastName,
              gender: gender ?? 0,
              data_box: dataBox || null
            })
            .where('person_id', '=', personId)
            .execute();

          // Update family relation role
          await trx.updateTable('family_relations')
            .set({ role: role as any })
            .where('source_id', '=', id)
            .where('target_id', '=', personId)
            .execute();

          // Handle titles
          await trx.deleteFrom('persons_degree').where('person_id', '=', personId).execute();
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
                  person_id: personId,
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

            const person = await trx.selectFrom('persons')
              .select('address_id')
              .where('person_id', '=', personId)
              .executeTakeFirstOrThrow();

            if (person.address_id) {
              await trx.updateTable('addresses')
                .set({
                  city_id: cityId,
                  street: address.street,
                  house_number: address.houseNumber
                })
                .where('address_id', '=', person.address_id)
                .execute();
            } else {
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
                .where('person_id', '=', personId)
                .execute();
            }
          }

          // Handle email
          if (email !== undefined) {
             await trx.deleteFrom('emails').where('person_id', '=', personId).execute();
             if (email) {
               await trx.insertInto('emails')
                 .values({
                   person_id: personId,
                   email,
                   type: 'personal',
                   is_verified: false
                 })
                 .execute();
             }
          }

          // Handle phone
          if (phone !== undefined) {
            await trx.deleteFrom('phone_numbers').where('person_id', '=', personId).execute();
            if (phone) {
              await trx.insertInto('phone_numbers')
                .values({
                  person_id: personId,
                  number: phone,
                  is_verified: false,
                  code: 420
                })
                .execute();
            }
          }

          // History
          await trx.insertInto('student_history')
            .values({
              student_id: id,
              teacher_id: user.person_id as number,
              type: 'updated_parent',
              data: JSON.stringify({
                parent_id: personId,
                role: role
              })
            })
            .execute();

          return { success: true };
        });

        return result;
      }

      throw new Error('Invalid mode');

    } catch (e) {
      console.error(e);
      return new Response(JSON.stringify({ error: 'Failed to add/update parent', details: e }), { status: 500 });
    }
  }, {
    params: t.Object({
      id: t.Number()
    }),
    body: t.Object({
      mode: t.Union([t.Literal('existing'), t.Literal('new'), t.Literal('edit')]),
      role: t.String(),
      personId: t.Optional(t.Number()),
      firstName: t.Optional(t.String()),
      lastName: t.Optional(t.String()),
      gender: t.Optional(t.Number()),
      prefixTitle: t.Optional(t.String()),
      suffixTitle: t.Optional(t.String()),
      email: t.Optional(t.String()),
      phone: t.Optional(t.String()),
      dataBox: t.Optional(t.Nullable(t.String())),
      address: t.Optional(t.Object({
        street: t.String(),
        houseNumber: t.String(),
        city: t.String(),
        postcode: t.Optional(t.String())
      }))
    })

  })
  
  .patch('/student/:id/parent/:parentId/role', async ({ cookie, params: { id, parentId }, body }) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return;
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.STUDENT_EDIT);
    if (!perm) return { error: 'no_permission' };

    try {
      await db.updateTable('family_relations')
        .set({
          role: body.role as any,
          legal_guardian_de_jure: body.legal_guardian_de_jure === 1,
          closest_legal_representative: body.closest_legal_representative === 1,
          allowed_to_receive_information: body.allowed_to_receive_information === 1
        })
        .where('source_id', '=', id)
        .where('target_id', '=', parentId)
        .execute();

      await db.insertInto('student_history')
        .values({
          student_id: id,
          teacher_id: user.person_id as number,
          type: 'updated_parent',
          data: JSON.stringify({ parent_id: parentId, changes: 'role_and_permissions' })
        })
        .execute();

      return { success: true };
    } catch (e) {
      console.error(e);
      return new Response(JSON.stringify({ error: 'Failed to update parent role', details: e }), { status: 500 });
    }
  }, {
    params: t.Object({
      id: t.Number(),
      parentId: t.Number()
    }),
    body: t.Object({
      role: t.String(),
      legal_guardian_de_jure: t.Number(),
      closest_legal_representative: t.Number(),
      allowed_to_receive_information: t.Number()
    })
  })

  .patch('/student/:id/address', async ({ cookie, params: { id }, body }) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return;
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.STUDENT_EDIT);
    if (!perm) {
      return { error: 'no_permission' };
    }

        const { street, houseNumber, city, postcode, countryId } = body;

        try {
            await db.transaction().execute(async (trx) => {
                // 1. Find or create city
                let cityId: number;
                const existingCity = await trx.selectFrom('cities')
                    .select('city_id')
                    .where('city_name', '=', city)
                    .where('postcode', '=', postcode || null)
                    .where('country_id', '=', countryId || 1)
                    .executeTakeFirst();

                if (existingCity) {
                    cityId = existingCity.city_id;
                } else {
                    const newCity = await trx.insertInto('cities')
                        .values({
                            city_name: city,
                            postcode: postcode || null,
                            country_id: countryId || 1
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
                    // Create new address only if person has NO address_id
                    const newAddress = await trx.insertInto('addresses')
                        .values({
                            city_id: cityId,
                            street,
                            house_number: houseNumber
                        })
                        .executeTakeFirstOrThrow();
                    const addressId = Number(newAddress.insertId);

                    // Update person link
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
      countryId: t.Optional(t.Number()),
      saveType: t.Optional(t.Union([t.Literal('change'), t.Literal('correction')], { default: 'correction' })),
      changes: t.Optional(t.Array(t.Object({
        label: t.String(),
        oldValue: t.Any(),
        newValue: t.Any()
      })))
    })
  })

  .get('/student/:id/history', async ({ params: { id }, query, cookie }) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };

    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.STUDENT_VIEW);
    if (!perm) return { error: 'no_permission' };

    const student_id = parseInt(id as any);

    let dbQuery = db.selectFrom('student_history')
      .select([
        'student_history.teacher_id',
        'student_history.type',
        'student_history.data',
        'student_history.created_at'
      ])
      .where('student_history.student_id', '=', student_id);

    if (query?.type) {
      const types = query.type.split(',').map(t => t.trim());
      dbQuery = dbQuery.where('student_history.type', 'in', types);
    }
    
    if (query?.dateFrom) {
      dbQuery = dbQuery.where('student_history.created_at', '>=', new Date(query.dateFrom));
    }
    
    if (query?.dateTo) {
      // Set to end of day
      const dateTo = new Date(query.dateTo);
      dateTo.setHours(23, 59, 59, 999);
      dbQuery = dbQuery.where('student_history.created_at', '<=', dateTo);
    }

    const limit = query?.limit ? parseInt(query.limit) : 20;
    const offset = query?.offset ? parseInt(query.offset) : 0;

    const history = await dbQuery
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset)
      .execute();

    const teacherNames = await format_person_map_by_ids(history.map((h) => h.teacher_id));

    const enrichedHistory = await Promise.all(history.map(async (h) => {
      const teacher_name = teacherNames.get(h.teacher_id);

      let dataObj: any = {};

      try {
        if (h.data && typeof h.data === 'object' && (h.data as any)['0']) {
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

      if (dataObj?.parent_id) {
        parent_full_name = await format_person_by_id(parseInt(dataObj.parent_id));
      }

      return {
        ...h,
        full_name: teacher_name,
        data: {
          ...dataObj,
          parent_full_name
        }
      };
    }));
    return enrichedHistory;
  }, {
    params: t.Object({
      id: t.String()
    }),
    query: t.Optional(t.Object({
      type: t.Optional(t.String()),
      dateFrom: t.Optional(t.String()),
      dateTo: t.Optional(t.String()),
      limit: t.Optional(t.String()),
      offset: t.Optional(t.String())
    }))
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
  })

  .get('/student/:id/topics', async ({ params: { id }, query: { syId }, cookie }) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    
    // Permission check: either same person or has STUDENT_VIEW permission
    if (user.person_id !== id) {
       const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.STUDENT_VIEW);
       if (!perm) return { error: 'no_permission' };
    }

    // Fetch school year to determine start and end date
    let schoolYear;
    if (syId) {
      schoolYear = await db.selectFrom('school_years')
        .select(['start', 'end'])
        .where('sy_id', '=', syId)
        .executeTakeFirst();
    } else {
      schoolYear = await db.selectFrom('school_years')
        .select(['start', 'end'])
        .where('start', '<=', moment().toDate())
        .where('end', '>=', moment().toDate())
        .executeTakeFirst();
      
      // Fallback if no current school year found
      if (!schoolYear) {
         schoolYear = await db.selectFrom('school_years')
           .select(['start', 'end'])
           .orderBy('start', 'desc')
           .executeTakeFirst();
      }
    }

    if (!schoolYear) return { error: 'invalid_school_year' };

    const topics = await db.selectFrom('student_groups')
      .innerJoin('classbook', 'student_groups.group_id', 'classbook.group_id')
      .innerJoin('subjects', 'classbook.subject_id', 'subjects.subject_id')
      .leftJoin('persons as teacher', 'classbook.teacher_id', 'teacher.person_id')
      .leftJoin('absence', (join) => join
        .onRef('absence.lesson_id', '=', 'classbook.classbook_id')
        .on('absence.student_id', '=', id)
      )
      .select([
        'classbook.classbook_id',
        'classbook.date',
        'classbook.day_hour',
        'classbook.topic',
        'classbook.note',
        'classbook.subject_id',
        'classbook.group_id',
        'subjects.label as subject_name',
        'subjects.shortcut as subject_shortcut',
        'teacher.first_name as teacher_first_name',
        'teacher.last_name as teacher_last_name',
        'absence.type as absence_type',
        'absence.minutes as absence_minutes',
        'absence.reason as absence_reason'
      ])
      .where('student_groups.student_id', '=', id)
      .where('classbook.date', '>=', schoolYear.start as Date)
      .where('classbook.date', '<=', schoolYear.end as Date)
      .where('classbook.date', '<=', moment().format('YYYY-MM-DD'))
      .orderBy('classbook.date', 'desc')
      .orderBy('classbook.day_hour', 'desc')
      .limit(1000)
      .execute();

    if (topics.length === 0) return {};

    const syStart = schoolYear.start;

    // To calculate lesson numbers correctly, we need all classbook entries for these group/subjects since start of year
    const groupIds = [...new Set(topics.map(t => t.group_id))];
    const subjectIds = [...new Set(topics.map(t => t.subject_id as number))];

    // Fetch counts or all records for calculation
    const allRelevantLessons = await db.selectFrom('classbook')
      .select(['classbook_id', 'group_id', 'subject_id', 'date', 'day_hour'])
      .where('group_id', 'in', groupIds)
      .where('subject_id', 'in', subjectIds)
      .where('date', '>=', syStart as Date)
      .where('date', '<=', schoolYear.end as Date)
      .orderBy('date', 'asc')
      .orderBy('day_hour', 'asc')
      .execute();

    // Map classbook_id to its ordinal number per (group, subject)
    const lessonNumberMap = new Map<number, number>();
    const counters: Record<string, number> = {};
    allRelevantLessons.forEach(l => {
      const key = `${l.group_id}-${l.subject_id}`;
      counters[key] = (counters[key] || 0) + 1;
      lessonNumberMap.set(l.classbook_id, counters[key]);
    });

    // Fetch homework
    const homework = await db.selectFrom('homework')
      .select(['homework_id', 'group_id', 'subject_id', 'assigned_at', 'headline', 'homework as content', 'due_date'])
      .where('group_id', 'in', groupIds)
      .where('subject_id', 'in', subjectIds)
      .where('assigned_at', '>=', syStart as Date)
      .where('assigned_at', '<=', schoolYear.end as Date)
      .execute();

    // Map homework and lesson numbers to topics
    const topicsWithExtra = topics.map(t => {
      const topicDate = moment(t.date).format('YYYY-MM-DD');
      const relatedHomework = homework.filter(h => 
        h.group_id === t.group_id && 
        h.subject_id === t.subject_id && 
        moment(h.assigned_at).format('YYYY-MM-DD') === topicDate
      );

      return {
        ...t,
        lesson_number: lessonNumberMap.get(t.classbook_id) || 0,
        teacher_name: t.teacher_first_name ? `${t.teacher_last_name} ${t.teacher_first_name[0]}.` : '',
        homework: relatedHomework
      };
    });

    // Grouping by date for UI
    const groupedTopics: Record<string, any[]> = {};
    topicsWithExtra.forEach(t => {
      const dateStr = moment(t.date).format('YYYY-MM-DD');
      if (!groupedTopics[dateStr]) groupedTopics[dateStr] = [];
      groupedTopics[dateStr].push(t);
    });

    return groupedTopics;
  }, {
    params: t.Object({ id: t.Number() }),
    query: t.Object({ syId: t.Optional(t.Number()) })
  });

export default elysiaApp;

