import { Generated } from "kysely"

export interface TimetableSchemasTable {
  ts_id: Generated<number>
  scope_id: number
  year: number
  day: number
  hour: number
  type: 'empty' | 'disabled' | 'maybe' | 'lunch' | 'continuous';
  assign_by: number
  assign_at: Generated<Date>
  updated_at: Generated<Date>
}