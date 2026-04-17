import { Generated } from "kysely"

export interface SavedReportSharesTable {
  share_id: Generated<number>
  report_id: number
  user_id: number // recipient
  shared_by: number
  created_at: Generated<Date>
}
