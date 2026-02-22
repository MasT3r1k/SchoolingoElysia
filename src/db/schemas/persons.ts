import { Generated } from "kysely"

export interface Persons {
  person_id: Generated<number>
  last_name: string
  first_name: string
  gender: number
  birthday: string | null
  birthnum: string | null
  birthplace_id: Generated<number | null>
  address_id: Generated<number | null>
  insurance_id: Generated<number | null>
  nationality_id: Generated<number | null>
}