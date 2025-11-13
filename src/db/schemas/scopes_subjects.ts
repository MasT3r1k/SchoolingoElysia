import { Generated } from "kysely"

export interface scopes_subjectsTable {
  ss_id: Generated<number>
  scope_id: number
  year: number
  subject_id: number
  hours_per_week: number
  exercise: number
  is_mandatory: boolean
  color: string | null
}