import { Generated } from "kysely"

export interface AvatarHistoryTable {
  id: Generated<number>
  user_id: number
  avatar: string
  created_at: Generated<Date>
}
