import { Generated } from "kysely"

export interface Traineeship_company_ratingTable {
  review_id: Generated<number>
  company_id: number
  student_id: number
  rating: number
  experience: Generated<string | null>
  would_recommend: Generated<boolean>
  is_anon: Generated<boolean>
  created_at: Generated<Date>
}
