import { Generated } from "kysely"

export interface Traineeship_companiesTable {
  company_id: Generated<number>
  name: string
  address_office: number
  address_trainee: number
  country_code: string
  ico: string
  dic: string
  vat_id: string
  web: Generated<string | null>
  rp_first_name: Generated<string | null>
  rp_last_name: Generated<string | null>
  phone: Generated<string | null>
  email: Generated<string | null>
  status: Generated<'request' | 'approved' | 'deleted' | 'acceptable'>;
  requested: Generated<Date | null> 
  created: Generated<Date>
  contact: Generated<string | null>
  description: Generated<string | null>
  activity: Generated<string | null>
  equipment: Generated<string | null>
}