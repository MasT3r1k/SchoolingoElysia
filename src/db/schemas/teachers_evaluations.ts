import { Generated } from "kysely"

export interface TeachersEvaluationsTable {
  id: Generated<number>
  person_id: number
  type: Generated<'observation' | 'annual' | 'self' | 'other'>
  title: string
  note: string | null
  date: string | null
  result_id: number | null
  created_at: Generated<Date>
}
