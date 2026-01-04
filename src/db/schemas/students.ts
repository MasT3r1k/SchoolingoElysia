import { Generated } from "kysely"

export interface StudentsTable {
  personId: number
  class: number
  status: Generated<'active' | 'former' | 'suspended'>,
  startStudy: Generated<Date>
}