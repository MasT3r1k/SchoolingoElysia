import { Generated } from "kysely"

export interface Persons {
  personId: Generated<number>
  lastName: string
  firstName: string
  gender: number
  birthday: string | null
  birthnum: string | null
  birthplace: number | null
  address: number | null
  GDPR: boolean
  insuranceId: number | null
}