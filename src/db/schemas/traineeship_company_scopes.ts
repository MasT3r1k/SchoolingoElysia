import { Generated } from "kysely"

export interface Traineeship_company_scopesTable {
  tscsId: Generated<number>
  companyId: number
  scopeId: number
  status: boolean
}
