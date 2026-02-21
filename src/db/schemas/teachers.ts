import { Generated } from "kysely"

export interface TeachersTable {
  person_id: number
  cabinet_id: number | null
  // Employee management fields
  role: Generated<'teacher' | 'admin_staff' | 'maintenance' | 'management' | 'personnel' | 'other'>
  employee_number: Generated<string | null>
  department: Generated<string | null>
  contract_type: Generated<'fulltime' | 'parttime' | 'dpp' | 'dpc' | null>
  start_date: Generated<string | null>
  end_date: Generated<string | null>
  status: Generated<'active' | 'inactive' | 'terminated'>
  hours_per_week: Generated<number | null>
  school_id: number;
}