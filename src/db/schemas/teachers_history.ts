import { Generated } from "kysely"

export interface TeachersHistoryTable {
  id: Generated<number>
  person_id: number
  title: string
  description: string | null
  details: Generated<string | null> // JSON string for diffs
  created_at: Generated<Date>
  author_id: number | null
  icon: string | null
  color: string | null
}
