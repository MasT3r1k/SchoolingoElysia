import { Generated } from "kysely"

export interface EmployeeVacationBalanceTable {
  balance_id: Generated<number>
  teacher_id: number
  year: number
  entitlement: number
  used: number
  remaining: number
}

export interface EmployeeVacationRequestsTable {
  request_id: Generated<number>
  teacher_id: number
  start_date: string
  end_date: string
  days: number
  type: 'vacation' | 'sick' | 'personal' | 'unpaid' | 'study' | 'parental'
  status: 'pending' | 'approved' | 'rejected'
  reason: string | null
  approved_by: number | null
  approved_at: string | null
  created_at: string
}
