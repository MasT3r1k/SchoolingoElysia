import { Generated } from "kysely"

export interface Teachers_salaryTable {
  salary_id: Generated<number>
  teacher_id: number | null
  role: string
  salary: number
  valid_from: string
  valid_to: string | null
  currency: string
  deductions: number
}