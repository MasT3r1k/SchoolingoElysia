import { Generated } from "kysely"

export interface UsersTable {
  user_id: Generated<number>
  person_id: number
  username: string
  password_id: number
  login_type: 'local' | 'ldap'
  role: 'student'|'teacher'|'parent'|'admin_staff'|'management'|'personnel'|'maintenance'|'other'
  active: Generated<boolean>;
  manager: number
  principal: boolean
  theme: number
  locale: string
  password_changed: string | null // date
  recommend_change_password: boolean
  cookies: number
  school_id: number
  auto_select_next_week: boolean
  fastlogin: boolean
  levels_exp: number
  '2fa': boolean
  '2fa_secret': string | null
  '2fa_activated': Date | null
  avatar: string;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}
