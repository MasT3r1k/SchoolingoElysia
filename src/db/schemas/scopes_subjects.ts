import { Generated } from "kysely"

export interface scopes_subjectsTable {
  ss_id: Generated<number>
  scope_id: number
  year: number
  subject_id: number
  hours_per_week: number
  exercise: Generated<number>
  is_mandatory: Generated<boolean>
  default_room: Generated<number | null>
  color: Generated<string | null>
}