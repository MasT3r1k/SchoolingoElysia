import { Generated } from "kysely"

export interface AddressesTable {
  address_id: Generated<number>
  city_id: number
  street: string
  house_number: string
}