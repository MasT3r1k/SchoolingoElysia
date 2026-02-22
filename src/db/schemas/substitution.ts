import { Generated } from "kysely"

export interface SubstitutionTable {
  substitution_id: Generated<number>
  group_id: Generated<number | null>
  start_date: Generated<Date>
  start_hour: number
  end_date: Generated<Date>
  end_hour: number
  type: Generated<string | null>
  subject_id: Generated<number | null>
  teacher_id: Generated<number | null>
  room_id: Generated<number | null>
  created: Generated<Date>
  event_id: Generated<number | null>
}