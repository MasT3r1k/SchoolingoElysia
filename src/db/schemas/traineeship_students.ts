import { Generated } from "kysely"

export interface Traineeship_studentsTable {
  student_id: number
  traineeship_id: number
  company_id: number
  instructor_id: Generated<number | null>
}