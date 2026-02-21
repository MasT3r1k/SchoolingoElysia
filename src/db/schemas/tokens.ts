import { Generated } from "kysely"

export interface TokensTable {
  token_id: Generated<number>
  token: string
  password_id: number
  user_agent: string | null
  expires: Date // datetime
  created: Generated<Date> // datetime
  user_id: number
  socket: Generated<string | null>
  ip: Generated<string | null>
}