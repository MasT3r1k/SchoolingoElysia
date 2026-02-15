import { Generated } from "kysely"

export interface SubjectsTable {
  subjectId: Generated<number>
  label: string
  shortcut: string
  isMain: number
  primaryHours: string
}