import { Generated } from "kysely"

export interface StudentMedicalRecordsTable {
  record_id: Generated<number>
  student_id: number
  type: string
  title: string
  description: string | null
  severity: Generated<'low' | 'medium' | 'high'>
  is_food_allergy: Generated<boolean>
  allergen_codes: Generated<string | null> // comma-separated codes or JSON
  created_at: Generated<Date>
}

