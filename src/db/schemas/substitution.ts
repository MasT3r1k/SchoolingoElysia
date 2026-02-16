import { Generated } from "kysely"

export interface SubstitutionTable {
  substitutionId: Generated<number>
  groupId: Generated<number | null>
  start_date: Date // date
  start_hour: number
  end_date: Date // date
  end_hour: number
  type: Generated<string | null>
  subjectId: Generated<number | null>
  teacherId: Generated<number | null>
  roomId: Generated<number | null>
  created: Generated<Date> // timestamp
  event_id: Generated<number | null>
}