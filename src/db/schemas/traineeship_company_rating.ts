export interface Traineeship_company_ratingTable {
  trcrId: number
  companyId: number
  studentId: number
  rating: number // decimal(10,1)
  description: string | null
}
