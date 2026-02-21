import { Generated } from "kysely";

export interface schoolsTable {
  school_id: Generated<number>
  name: string
  short_name: string
  district_id: number
  code: string
  owner: number
  total_storage_limit: number;
  api_token: string
  license_type: 'FREE' | 'BASIC' | 'PRO' | 'DEV';
  license_until: Generated<Date | null>
  created: Generated<Date>
  start_hour: number
  start_minute: number
  lesson_hour: number
  break_time: number
  reset_password_with_email: boolean
  warning_absence_percent: number
  fastlogin: boolean
  modules: string
  students_limit: number
  gdpr_first_name: string
  gdpr_last_name: string
  gdpr_phone: string
  gdpr_email: string
  gdpr_mobile: string
  gdpr_databox: string
  gdpr_web: string
  // Auth settings
  auth_classic: number // boolean
  auth_ldap: number // boolean
  auth_passkeys: number // boolean
  session_lifetime_minutes: number
  max_login_attempts: number
  backup_interval: number | null
  auto_update: number // boolean
  auto_update_interval: number
  country_id: number | null
  red_izo: string
  ico: string
  school_type: string
  izo: string
}