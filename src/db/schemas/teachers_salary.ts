import { Generated } from "kysely"

export interface Teachers_salaryTable {
  salaryId: Generated<number>
  teacherId: number | null
  role: string
  salary: number
  validFrom: string
  validTo: string | null
  currency: string
  deductions: number
}