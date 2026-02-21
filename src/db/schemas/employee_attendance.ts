import { Generated } from "kysely"

export interface EmployeeAttendanceTable {
  attendance_id: Generated<number>
  teacher_id: number
  date: string
  check_in: string | null
  check_out: string | null
  break_minutes: number
  worked_minutes: number
  type: 'regular' | 'overtime' | 'homeoffice' | 'business_trip'
  notes: string | null
  approved: boolean
  approved_by: number | null
}
