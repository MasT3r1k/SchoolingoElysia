import { Generated } from "kysely"

export interface Traineeship_company_ratingTable {
  reviewId: Generated<number>
  companyId: number
  studentId: number
  rating: number
  experience: string | null
  would_recommend: boolean
  is_anon: boolean
  created_at: Date
}
