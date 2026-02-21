import { Generated } from "kysely"

export interface Student_homeworkTable {
  student_id: number
  homework_id: number
  submitted: Generated<boolean>
  finished: Generated<boolean>
}
