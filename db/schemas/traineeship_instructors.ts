
export interface Traineeship_instructorsTable {
  personId: number
  companyId: number
  created: string // timestamp
  addedBy: number | null
  status: 'active' | 'deleted'
}