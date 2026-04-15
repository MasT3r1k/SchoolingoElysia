import { Generated } from "kysely"

export interface TeachersEducationTable {
  id: Generated<number>
  person_id: number
  title: string
  institution: string | null
  year: number | null
  type: Generated<'degree' | 'certification' | 'dvpp' | 'other'>
  date: string | null
  file_url: string | null
  created_at: Generated<Date>
}
