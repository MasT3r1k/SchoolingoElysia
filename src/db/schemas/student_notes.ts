import { Generated } from "kysely"

export interface StudentNotesTable {
  note_id: Generated<number>
  student_id: number
  teacher_id: number
  content: string
  is_public: Generated<boolean>
  created_at: Generated<Date>
  updated_at: Generated<Date>
}
