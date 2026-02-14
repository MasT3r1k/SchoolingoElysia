import { Generated } from "kysely"

export interface AddressesTable {
  addressId: Generated<number>
  cityId: number
  street: string
  houseNumber: string
}