import { Generated } from "kysely"

export interface EmployeeBonusesTable {
  bonus_id: Generated<number>
  teacher_id: number
  date: string
  amount: number
  type: 'performance' | 'annual' | 'project' | 'other'
  reason: string
  approved_by: number
  paid: boolean
  paid_date: string | null
}
