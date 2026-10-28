import { Elysia, t } from 'elysia';
import { SchoolService } from './school.service';
import { CreateSchoolYearSchema, UpdateSchoolYearSchema } from './school.dto';
import { db } from '@database';

export const schoolRouter = new Elysia({ prefix: '/api/v1', name: 'SchoolRouter' })
  // 1. School Information and Configuration (Supports /school and /school/ without auth)
  .get(
    '/school',
    async ({ school, set }: any) => {
      if (!school) {
        set.status = 412;
        return { error: 'School not configured' };
      }
      return await SchoolService.getSchoolConfig(school.school_id);
    },
    {
      detail: { tags: ['School'], summary: 'Get current school configuration and breaks' },
    }
  )
  .get(
    '/school/',
    async ({ school, set }: any) => {
      if (!school) {
        set.status = 412;
        return { error: 'School not configured' };
      }
      return await SchoolService.getSchoolConfig(school.school_id);
    },
    {
      detail: { tags: ['School'], summary: 'Get current school configuration (trailing slash)' },
    }
  )

  // 2. Study Scopes / Fields
  .get(
    '/scopes',
    async () => {
      return await SchoolService.getScopes();
    },
    {
      detail: { tags: ['School'], summary: 'Get available study fields and scopes' },
    }
  )

  // 3. Degrees and Insurance Lookups
  .get(
    '/school/degrees',
    async () => {
      return await SchoolService.getDegrees();
    },
    {
      detail: { tags: ['School'], summary: 'Get list of academic degrees' },
    }
  )
  .get(
    '/school/insurance',
    async () => {
      return await SchoolService.getInsuranceCompanies();
    },
    {
      detail: { tags: ['School'], summary: 'Get list of insurance companies' },
    }
  )

  // 4. School Years Management
  .get(
    '/school/years',
    async ({ school }: any) => {
      return await SchoolService.getSchoolYears(school?.school_id);
    },
    {
      detail: { tags: ['School'], summary: 'Get list of school years' },
    }
  )
  .post(
    '/school/years',
    async ({ body, school, set }: any) => {
      if (!school) {
        set.status = 412;
        return { error: 'School not configured' };
      }
      return await SchoolService.createSchoolYear(school.school_id, body);
    },
    {
      body: CreateSchoolYearSchema,
      detail: { tags: ['School'], summary: 'Create new school year' },
    }
  )
  .put(
    '/school/years/:id',
    async ({ params: { id }, body }: any) => {
      return await SchoolService.updateSchoolYear(Number(id), body);
    },
    {
      body: UpdateSchoolYearSchema,
      detail: { tags: ['School'], summary: 'Update existing school year' },
    }
  )
  .delete(
    '/school/years/:id',
    async ({ params: { id } }: any) => {
      return await SchoolService.deleteSchoolYear(Number(id));
    },
    {
      detail: { tags: ['School'], summary: 'Delete school year' },
    }
  )

  // 5. Classes Management
  .get(
    '/school/classes',
    async ({ school }: any) => {
      if (!school) return [];
      return await SchoolService.getClasses(school.school_id);
    },
    {
      detail: { tags: ['School'], summary: 'Get all classes with student counts' },
    }
  )
  .get(
    '/school/subjects',
    async ({ school }: any) => {
      if (!school) return [];
      return await db
        .selectFrom('subjects')
        .selectAll()
        .where('school_id', '=', school.school_id)
        .orderBy('label', 'asc')
        .execute();
    },
    {
      detail: { tags: ['School'], summary: 'Get school subjects' },
    }
  )
  .get(
    '/school/rooms',
    async ({ school }: any) => {
      if (!school) return [];
      return await db
        .selectFrom('building_rooms')
        .innerJoin('building_floors', 'building_floors.bf_id', 'building_rooms.floor_id')
        .innerJoin('buildings', 'buildings.building_id', 'building_floors.building_id')
        .select(['building_rooms.room_id', 'building_rooms.name', 'building_rooms.capacity'])
        .where('buildings.school_id', '=', school.school_id)
        .orderBy('building_rooms.name', 'asc')
        .execute();
    },
    {
      detail: { tags: ['School'], summary: 'Get school rooms' },
    }
  )
  .get(
    '/school/classes/metadata',
    async ({ school }: any) => {
      if (!school) return { scopes: [], teachers: [], rooms: [] };
      const [scopes, teachersRaw, rooms] = await Promise.all([
        db.selectFrom('scopes').selectAll().where('school_id', '=', school.school_id).execute(),
        db
          .selectFrom('teachers')
          .innerJoin('persons', 'persons.person_id', 'teachers.person_id')
          .select(['teachers.person_id as id', 'persons.first_name', 'persons.last_name'])
          .where('teachers.school_id', '=', school.school_id)
          .execute(),
        db
          .selectFrom('building_rooms')
          .innerJoin('building_floors', 'building_floors.bf_id', 'building_rooms.floor_id')
          .innerJoin('buildings', 'buildings.building_id', 'building_floors.building_id')
          .select(['building_rooms.room_id as id', 'building_rooms.name'])
          .where('buildings.school_id', '=', school.school_id)
          .execute(),
      ]);
      return {
        scopes: scopes.map((s) => ({ id: s.scope_id, name: s.name })),
        teachers: teachersRaw.map((t) => ({ id: t.id, firstName: t.first_name, lastName: t.last_name })),
        rooms,
      };
    },
    {
      detail: { tags: ['School'], summary: 'Get metadata for class creation' },
    }
  )
  .post(
    '/school/classes',
    async ({ body, school, set }: any) => {
      if (!school) {
        set.status = 412;
        return { error: 'School not configured' };
      }
      const { name, year, scopeId, headTeacherId, classroomId } = body;
      if (!name || !year || !scopeId) {
        set.status = 400;
        return { error: 'Missing required fields' };
      }

      let prefix = name;
      let suffix = '';
      const match = name.match(/^(\d+\.?)(.*)/);
      if (match) {
        prefix = match[1];
        suffix = match[2];
      } else if (name.length > 2) {
        prefix = name.substring(0, 1) + '.';
        suffix = name.substring(1);
      }

      const currentYear = await db
        .selectFrom('school_years')
        .where('school_id', '=', school.school_id)
        .where('start', '<=', new Date())
        .where('end', '>=', new Date())
        .select('sy_id')
        .executeTakeFirst();

      if (!currentYear) {
        set.status = 400;
        return { error: 'No active school year found' };
      }

      await db
        .insertInto('classes')
        .values({
          prefix,
          suffix,
          year_id: currentYear.sy_id,
          teacher_id: headTeacherId || 0,
          room_id: classroomId || 0,
          scope_id: scopeId,
        })
        .execute();

      return { success: true };
    },
    {
      body: t.Object({
        name: t.String(),
        year: t.Number(),
        scopeId: t.Number(),
        headTeacherId: t.Optional(t.Number()),
        classroomId: t.Optional(t.Number()),
      }),
      detail: { tags: ['School'], summary: 'Create new class' },
    }
  )
  .delete(
    '/school/classes/:id',
    async ({ params, school, set }: any) => {
      if (!school) {
        set.status = 412;
        return { error: 'School not configured' };
      }
      await db.deleteFrom('classes').where('class_id', '=', parseInt(params.id)).execute();
      return { success: true };
    },
    {
      detail: { tags: ['School'], summary: 'Delete class by id' },
    }
  )

  // 6. Architecture Overview
  .get(
    '/school/architecture/overview',
    async ({ school, set }: any) => {
      if (!school) {
        set.status = 412;
        return { error: 'School not configured' };
      }
      return await SchoolService.getArchitectureOverview(school.school_id);
    },
    {
      detail: { tags: ['Architecture'], summary: 'Get architecture counts and statistics' },
    }
  )
  .get(
    '/school/architecture/buildings',
    async ({ school, set }: any) => {
      if (!school) {
        set.status = 412;
        return { error: 'School not configured' };
      }
      return await SchoolService.getBuildings(school.school_id);
    },
    {
      detail: { tags: ['Architecture'], summary: 'Get list of school buildings' },
    }
  );
