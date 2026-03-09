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
  type: 'vacation' | 'inability_to_work' | 'personal_obstacle' | 'education' | 'school_event' | 'business_trip' | 'other' | 'extra_vacation'
  status: 'pending' | 'approved' | 'rejected'
  reason: string | null
  approved_by: number | null
  approved_at: Date | null
  created_at: Generated<Date>;
}
