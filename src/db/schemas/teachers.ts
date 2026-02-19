import { Generated } from "kysely"

export interface TeachersTable {
  personId: number
  cabinet: number | null
  // Employee management fields
  role: Generated<'teacher' | 'admin_staff' | 'maintenance' | 'management' | 'personnel' | 'other'>
  employeeNumber: Generated<string | null>
  department: Generated<string | null>
  contractType: Generated<'fulltime' | 'parttime' | 'dpp' | 'dpc' | null>
  startDate: Generated<string | null>
  endDate: Generated<string | null>
  status: Generated<'active' | 'inactive' | 'terminated'>
  hoursPerWeek: Generated<number | null>
  school_id: number;
}