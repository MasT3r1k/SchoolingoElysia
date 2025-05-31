import { AbsenceType } from "../../types/absence"

export interface AbsenceTable {
  student: number
  lesson: number
  type: AbsenceType
  minutes: number | null
  reason: string | null
  note: string | null
}