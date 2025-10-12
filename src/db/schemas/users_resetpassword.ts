import { Generated } from "kysely"

export interface Users_resetpasswordTable {
  user_resetpassword_id: Generated<number>
  email_token: string
  user_id: number
  email: string | null
  created_at: Generated<Date>
  expires_at: Date
  otp_code: string | null
  ip: string | null
  user_agent: string
}