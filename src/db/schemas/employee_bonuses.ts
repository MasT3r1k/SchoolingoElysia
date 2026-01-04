import { Generated } from "kysely"

export interface EmployeeBonusesTable {
  bonusId: Generated<number>
  teacherId: number
  date: string
  amount: number
  type: 'performance' | 'annual' | 'project' | 'other'
  reason: string
  approvedBy: number
  paid: boolean
  paidDate: string | null
}
