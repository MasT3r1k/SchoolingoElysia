import { Generated } from "kysely"

export interface EmployeeVacationBalanceTable {
  balanceId: Generated<number>
  teacherId: number
  year: number
  entitlement: number
  used: number
  remaining: number
}

export interface EmployeeVacationRequestsTable {
  requestId: Generated<number>
  teacherId: number
  startDate: string
  endDate: string
  days: number
  type: 'vacation' | 'sick' | 'personal' | 'unpaid' | 'study' | 'parental'
  status: 'pending' | 'approved' | 'rejected'
  reason: string | null
  approvedBy: number | null
  approvedAt: string | null
  createdAt: string
}
