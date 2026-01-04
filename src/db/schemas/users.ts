export interface UsersTable {
  userId: number
  person: number
  username: string
  password: number
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
  avatar: string
}
