import { Generated } from 'kysely'

export interface EmailConfigTable {
  config_id: Generated<number>
  school_id: number
  provider: string
  host: string
  port: number
  username: string | null
  password: string | null
  encryption: 'none' | 'ssl' | 'tls'
  from_email: string
  from_name: string
  enabled: number // boolean stored as tinyint usually
  created_at: Generated<Date>
  updated_at: Generated<Date>
}
