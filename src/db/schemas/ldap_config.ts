import { Generated } from 'kysely'

export interface LdapConfigTable {
  config_id: Generated<number>
  school_id: number
  server_url: string
  bind_dn: string | null
  bind_password: string | null
  search_base: string
  user_filter: string | null
  mapping_username: string | null
  mapping_email: string | null
  mapping_name: string | null
  enabled: number // boolean
  created_at: Generated<Date>
  updated_at: Generated<Date>
}
