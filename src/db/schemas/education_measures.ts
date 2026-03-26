import { Generated } from 'kysely'

export interface educationMeasuresTable {
  em_id: Generated<number>
  student_id: number
  type: Generated<string>
  category: Generated<'positive' | 'negative'>
  severity: Generated<'low' | 'medium' | 'high'>
  reason: string
  description: Generated<string | null>
  issued_by: number
  issued_at: Generated<Date>
  informed_parents: Generated<boolean>
  status: Generated<'draft' | 'approved' | 'cancelled'>
}
