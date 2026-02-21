import { AbsenceType } from "../../types/absence"

export interface AbsenceTable {
  student_id: number
  lesson_id: number
  type: AbsenceType
  minutes: number | null
  reason: string | null
  note: string | null
}