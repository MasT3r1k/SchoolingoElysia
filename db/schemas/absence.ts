export interface AbsenceTable {
  student: number
  lesson: number
  type: number
  minutes: number | null
  reason: string | null
  note: string | null
}