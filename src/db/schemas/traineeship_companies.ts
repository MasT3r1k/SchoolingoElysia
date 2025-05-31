export interface Traineeship_companiesTable {
  companyId: number
  name: string
  addressOffice: number
  addressTrainee: number
  countryCode: string
  ico: string
  dic: string
  vatId: string
  web: string | null
  rp_firstName: string | null
  rp_lastName: string | null
  phone: string | null
  email: string | null
  status: 'request' | 'approved' | 'deleted' | 'acceptable'
  requested: string | null // timestamp
  created: string // timestamp
  contact: string | null
  description: string | null
  activity: string | null
  equipment: string | null
}