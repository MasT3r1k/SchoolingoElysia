import { Generated } from "kysely"

export interface Users_credentialsTable {
  id: Generated<number>
  credential_id: string
  userId: number
  public_key: string
  counter: number
  device_name: string
  device_type: 'singleDevice' | 'multiDevice'
  transports: string
  registered_at: Generated<Date>
  last_used: Date | null
  backed_up: boolean
}