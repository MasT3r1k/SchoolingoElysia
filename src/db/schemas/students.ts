import { Generated } from "kysely"

export interface StudentsTable {
  person_id: number
  class_id: number
  status: Generated<'active' | 'former' | 'suspended'>,
  start_study: Generated<Date>
  abroad: Generated<boolean>;
  school_counseling_facility: Generated<boolean>;
}