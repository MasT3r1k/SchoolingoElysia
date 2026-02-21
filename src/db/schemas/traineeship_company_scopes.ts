import { Generated } from "kysely"

export interface Traineeship_company_scopesTable {
  tscs_id: Generated<number>
  company_id: number
  scope_id: number
  status: boolean
}
