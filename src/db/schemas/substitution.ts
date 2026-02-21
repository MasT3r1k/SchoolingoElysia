import { Generated } from "kysely"

export interface SubstitutionTable {
  substitution_id: Generated<number>
  group_id: Generated<number | null>
  start_date: Date // date
  start_hour: number
  end_date: Date // date
  end_hour: number
  type: Generated<string | null>
  subject_id: Generated<number | null>
  teacher_id: Generated<number | null>
  room_id: Generated<number | null>
  created: Generated<Date> // timestamp
  event_id: Generated<number | null>
}