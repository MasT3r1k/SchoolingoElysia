import { Generated } from "kysely"

export interface SubstitutionTable {
  substitutionId: Generated<number>
  groupId: number
  start_date: string // date
  start_hour: number
  end_date: string // date
  end_hour: number
  type: string
  subjectId: number | null
  teacherId: number | null
  created: Generated<Date> // timestamp
  event_id: number | null
}