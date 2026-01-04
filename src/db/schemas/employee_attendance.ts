import { Generated } from "kysely"

export interface EmployeeAttendanceTable {
  attendanceId: Generated<number>
  teacherId: number
  date: string
  checkIn: string | null
  checkOut: string | null
  breakMinutes: number
  workedMinutes: number
  type: 'regular' | 'overtime' | 'homeoffice' | 'business_trip'
  notes: string | null
  approved: boolean
  approvedBy: number | null
}
