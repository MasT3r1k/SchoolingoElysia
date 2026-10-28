import { db } from '@database';
import { sql } from 'kysely';
import moment from 'moment';

export class SchoolService {
  /**
   * Retrieves main school configuration, current school year and breaks
   */
  public static async getSchoolConfig(schoolId: number) {
    const now = moment().format('YYYY-MM-DD');

    const [schoolData, breaks, year] = await Promise.all([
      db
        .selectFrom('schools')
        .leftJoin('districts', 'districts.district_id', 'schools.district_id')
        .select([
          'schools.name',
          'schools.short_name',
          'schools.code',
          'schools.start_hour',
          'schools.start_minute',
          'schools.lesson_hour',
          'schools.break_time',
          'schools.reset_password_with_email',
          'schools.fastlogin',
          'schools.warning_absence_percent',
          'schools.modules',
          'schools.students_limit',
          'districts.district',
          'schools.auth_classic',
          'schools.auth_ldap',
          'schools.auth_passkeys',
          'schools.gdpr_first_name',
          'schools.gdpr_last_name',
          'schools.gdpr_phone',
          'schools.gdpr_email',
          'schools.gdpr_mobile',
          'schools.gdpr_databox',
          'schools.gdpr_web',
          'schools.msg_type_noticeboard_active',
          'schools.employee_vacation_days_default',
          'schools.employee_vacation_requests_enabled',
          'schools.employee_attendance_enabled',
          'schools.employee_salaries_enabled',
        ])
        .where('schools.school_id', '=', schoolId)
        .executeTakeFirst(),

      db
        .selectFrom('school_breaks')
        .select(['school_breaks.hour', 'school_breaks.minutes'])
        .where('school_breaks.school_id', '=', schoolId)
        .execute(),

      db
        .selectFrom('school_years')
        .select(['school_years.start', 'school_years.midterm', 'school_years.end'])
        .where('school_years.start', '<=', new Date(now))
        .where('school_years.end', '>=', new Date(now))
        .executeTakeFirst(),
    ]);

    return {
      ...schoolData,
      year,
      breaks,
      login_expires: 15000,
    };
  }

  /**
   * Get all active study scopes / fields
   */
  public static async getScopes() {
    return await db
      .selectFrom('scopes')
      .select([
        'scopes.scope_id',
        'scopes.name as scopeName',
        'scopes.shortcut as scopeShort',
        'scopes.code as scopeCode',
        'scopes.years',
        'scopes.is_active',
      ])
      .execute();
  }

  /**
   * Degrees and Insurance lookups
   */
  public static async getDegrees() {
    return await db.selectFrom('degrees').selectAll().orderBy('weight', 'desc').execute();
  }

  public static async getInsuranceCompanies() {
    return await db.selectFrom('insurance_companies').selectAll().orderBy('insurance', 'asc').execute();
  }

  /**
   * School Years
   */
  public static async getSchoolYears(schoolId?: number) {
    let query = db.selectFrom('school_years').select(['sy_id', 'start', 'end', 'midterm', 'current']);
    if (schoolId) query = query.where('school_id', '=', schoolId);
    return await query.orderBy('start', 'desc').execute();
  }

  public static async createSchoolYear(schoolId: number, data: { start: string; end: string; midterm: string; current?: boolean }) {
    await db
      .insertInto('school_years')
      .values({
        school_id: schoolId,
        start: new Date(data.start),
        end: new Date(data.end),
        midterm: new Date(data.midterm),
        current: !!data.current,
      })
      .execute();
    return { success: true };
  }

  public static async updateSchoolYear(id: number, data: { start?: string; end?: string; midterm?: string; current?: boolean }) {
    if (data.current) {
      await db.updateTable('school_years').set({ current: false }).where('sy_id', '!=', id).execute();
    }

    const updateValues: any = {};
    if (data.start) updateValues.start = new Date(data.start);
    if (data.end) updateValues.end = new Date(data.end);
    if (data.midterm) updateValues.midterm = new Date(data.midterm);
    if (data.current !== undefined) updateValues.current = !!data.current;

    await db.updateTable('school_years').set(updateValues).where('sy_id', '=', id).execute();
    return { success: true };
  }

  public static async deleteSchoolYear(id: number) {
    await db.deleteFrom('school_years').where('sy_id', '=', id).execute();
    return { success: true };
  }

  /**
   * Classes and Classrooms
   */
  public static async getClasses(schoolId: number) {
    const classes = await db
      .selectFrom('classes')
      .innerJoin('school_years as sy', 'sy.sy_id', 'classes.year_id')
      .leftJoin('scopes', 'scopes.scope_id', 'classes.scope_id')
      .leftJoin('teachers', 'teachers.person_id', 'classes.teacher_id')
      .leftJoin('persons', 'persons.person_id', 'teachers.person_id')
      .leftJoin('building_rooms', 'building_rooms.room_id', 'classes.room_id')
      .select([
        'classes.class_id',
        'classes.prefix',
        'classes.suffix',
        'sy.start as sy_start',
        'scopes.name as fieldOfStudy',
        'persons.first_name as teacher_first_name',
        'persons.last_name as teacher_last_name',
        'persons.avatar as teacher_avatar',
        'building_rooms.name as classroom',
        sql<number>`(SELECT COUNT(person_id) FROM students WHERE students.class_id = classes.class_id)`.as('studentsCount'),
      ])
      .where('sy.school_id', '=', schoolId)
      .execute();

    return classes.map((c) => {
      const startYear = new Date(c.sy_start).getFullYear();
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();
      let yearDiff = currentYear - startYear;
      if (currentMonth >= 8) yearDiff++;

      return {
        id: c.class_id,
        name: `${c.prefix}${yearDiff}${c.suffix}`,
        year: yearDiff,
        fieldOfStudy: c.fieldOfStudy || null,
        headTeacher: c.teacher_first_name && c.teacher_last_name ? `${c.teacher_first_name} ${c.teacher_last_name}` : null,
        headTeacherAvatar: c.teacher_avatar || null,
        classroom: c.classroom || null,
        studentsCount: c.studentsCount || 0,
      };
    });
  }

  /**
   * Architecture & Buildings
   */
  public static async getArchitectureOverview(schoolId: number) {
    const stats = await Promise.all([
      db.selectFrom('buildings').select(sql<number>`count(*)`.as('count')).where('school_id', '=', schoolId).executeTakeFirst(),
      db
        .selectFrom('building_rooms')
        .innerJoin('building_floors', 'building_floors.bf_id', 'building_rooms.floor_id')
        .innerJoin('buildings', 'buildings.building_id', 'building_floors.building_id')
        .select(sql<number>`count(*)`.as('count'))
        .where('buildings.school_id', '=', schoolId)
        .executeTakeFirst(),
      db.selectFrom('supervision_places').select(sql<number>`count(*)`.as('count')).where('school_id', '=', schoolId).executeTakeFirst(),
      db.selectFrom('inventory').select(sql<number>`count(*)`.as('count')).where('school_id', '=', schoolId).executeTakeFirst(),
    ]);

    return {
      buildings: Number(stats[0]?.count || 0),
      rooms: Number(stats[1]?.count || 0),
      hallways: Number(stats[2]?.count || 0),
      inventory: Number(stats[3]?.count || 0),
    };
  }

  public static async getBuildings(schoolId: number) {
    return await db
      .selectFrom('buildings')
      .selectAll()
      .where('buildings.school_id', '=', schoolId)
      .execute();
  }
}
