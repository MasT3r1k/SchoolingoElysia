import { Generated } from "kysely"

export interface SavedReportsTable {
  report_id: Generated<number>
  user_id: number
  name: string
  type: string
  config: string // JSON string
  created_at: Generated<Date>
  updated_at: Generated<Date>
}
