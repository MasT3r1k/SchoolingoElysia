import { Generated } from "kysely";

export interface schoolsTable {
  schoolId: Generated<number>
  name: string
  shortName: string
  district: number
  code: string
  owner: number
  total_storage_limit: number;
  apiToken: string
  license_type: 'FREE' | 'BASIC' | 'PRO' | 'DEV';
  license_until: Generated<Date | null>
  created: Generated<Date>
  startHour: number
  startMinute: number
  lessonHour: number
  breakTime: number
  resetPasswordWithEmail: boolean
  warningAbsencePercent: number
  fastlogin: boolean
  modules: string
  studentsLimit: number 
  gdpr_firstname: string
  gdpr_lastname: string
  gdpr_phone: string
  gdpr_email: string
  gdpr_mobile: string
  gdpr_databox: string
  gdpr_web: string
  // Auth settings
  auth_classic: number // boolean
  auth_ldap: number // boolean
  auth_qr: number // boolean
  auth_passkeys: number // boolean
  session_lifetime_minutes: number
  max_login_attempts: number
}