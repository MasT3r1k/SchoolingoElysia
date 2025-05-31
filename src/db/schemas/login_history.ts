import { Generated } from "kysely";

export interface login_historyTable {
  loginId: Generated<number>
  userId: number
  success: boolean
  ip: string | null
  userAgent: string
  created: Generated<Date>
}
