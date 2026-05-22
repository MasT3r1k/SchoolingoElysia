import { Generated } from 'kysely'
 
export interface educationMeasureTypesTable {
  emt_id: Generated<number>
  order_index: Generated<number>
  shortcut: string
  label_1st: string
  label_4th: string
  added_by: Generated<number | null>;
  added_at: Generated<Date>
}
