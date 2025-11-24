import { Generated } from "kysely";

export interface schoolsTable {
  schoolId: Generated<number>
  name: string
  shortName: string
  district: number
  code: string
  owner: number
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
}