import { Generated } from "kysely"

export interface TeachersAgendaTable {
  id: Generated<number>
  person_id: number
  title: string
  type: Generated<'medical' | 'bozp' | 'po' | 'other'>
  status: Generated<'valid' | 'critical' | 'expired'>
  expires_at: string | null
  note: string | null
  created_at: Generated<Date>
}
