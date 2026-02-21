import { Generated } from "kysely"

export interface Users_backup_codesTable {
  ubc_id: Generated<number>
  user_id: number
  code: string
  used: boolean
  used_at: Date | null
  used_ip: string | null
  created_at: Generated<Date>
}