import { Generated } from "kysely"

export interface MedicalRecordsTable {
  record_id: Generated<number>
  person_id: number
  type: Generated<string>
  title: Generated<string | null>
  description: Generated<string | null>
  severity: Generated<'low' | 'medium' | 'high'>
  is_food_allergy: Generated<boolean>
  allergen_codes: Generated<string | null> // comma-separated codes or JSON
  created_at: Generated<Date>
}

