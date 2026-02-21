import { Generated } from "kysely"

export interface SubjectsTable {
  subject_id: Generated<number>
  label: string
  shortcut: string
  is_main: boolean
  is_class_time: Generated<boolean>
  primary_hours: string
  school_id: number
}