import { Generated } from "kysely"

export interface Teachers_subjectTable {
  id: Generated<number>
  teacher_id: number
  subject_id: number
  description: Generated<string | null>
  is_main: Generated<number> // 0 or 1
  created_at: Generated<Date>
}