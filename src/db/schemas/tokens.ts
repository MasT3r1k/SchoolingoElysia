import { Generated } from "kysely"

export interface TokensTable {
  tokenId: Generated<number>
  token: string
  password: number
  userAgent: string | null
  expires: Date // datetime
  created: Generated<Date> // datetime
  userId: number
  socket: string | null
  ip: string | null
}