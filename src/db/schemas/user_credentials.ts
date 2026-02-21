import { Generated } from "kysely"

export interface Users_credentialsTable {
  id: Generated<number>
  credential_id: string
  user_id: number
  public_key: string
  counter: number
  device_name: string
  device_type: Generated<'singleDevice' | 'multiDevice'>
  transports: string
  registered_at: Generated<Date>
  last_used: Generated<Date | null>
  backed_up: Generated<boolean>
}