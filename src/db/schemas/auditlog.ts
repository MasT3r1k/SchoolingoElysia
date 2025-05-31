import { ColumnType } from "kysely"

export interface AuditlogTable {
  auditId: number
  admin: number | null
  type: string // Enum('') – POZOR: původní enum je prázdný
  message: string
  created: ColumnType<Date, string | undefined, never>
}