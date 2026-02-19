import { Generated } from "kysely"

export interface SubjectsTable {
  subjectId: Generated<number>
  label: string
  shortcut: string
  isMain: boolean
  isClassTime: Generated<boolean>
  primaryHours: string
  school_id: number
}