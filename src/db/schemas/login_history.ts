import { Generated } from "kysely";

export interface login_historyTable {
  loginId: Generated<number>
  userId: number
  type: 'password' | 'qrcode' | 'passkey'
  success: boolean
  error: string | null
  ip: string | null
  userAgent: string
  created: Generated<Date>
}
