import { Generated } from "kysely";

export interface BackupsTable {
  backup_id: Generated<number>
  filename: string
  size: number
  type: string // 'auto' or 'manual'
  status: string // 'success', 'failed'
  commit_hash?: string | null
  created: Generated<Date>
}
