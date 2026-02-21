import { Generated } from "kysely"

export interface webauthn_challengesTable {
  user_id: number
  challenge: string
  created_at: Generated<Date>
  expires_at: Date
}