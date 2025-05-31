import { Generated } from "kysely"

export interface SubstitutionTable {
  substitutionId: Generated<number>
  groupId: number
  date: string // date
  hour: number
  subjectId: number | null
  teacherId: number | null
  created: Generated<Date> // timestamp
  event_id: number | null
}