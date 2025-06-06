import { Generated } from "kysely"

export interface webauthn_challengesTable {
  userId: number
  challenge: string
  createdAt: Generated<Date>
  expiresAt: Date
}