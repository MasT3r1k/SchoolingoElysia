import { Generated } from "kysely"

export interface UsersTable {
  userId: Generated<number>
  person: number
  username: string
  password: number
  login_type: 'local' | 'ldap'
  role: 'student'|'teacher'|'parent'|'admin_staff'|'management'|'personnel'|'maintenance'|'other'
  manager: number
  principal: boolean
  theme: number
  locale: string
  passwordChanged: string | null // date
  recommendChangePassword: boolean
  cookies: number
  school: number
  autoSelectNextWeek: boolean
  fastlogin: boolean
  levels_exp: number
  '2fa': boolean
  '2fa_secret': string | null
  '2fa_activated': Date | null
  avatar: string;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}
