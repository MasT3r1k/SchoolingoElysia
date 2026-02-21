import { Generated } from "kysely"

export interface OAuthTokensTable {
  id: Generated<number>
  user_id: number
  provider: 'google' | 'microsoft'
  access_token: string
  refresh_token: string | null
  expires_at: Date
  created_at: Generated<Date>
}
