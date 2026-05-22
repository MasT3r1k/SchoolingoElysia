import { Generated } from 'kysely'
 
export interface educationMeasureTemplatesTable {
  template_id: Generated<number>
  title: string
  content: string
  added_by: Generated<number | null>;
  added_at: Generated<Date>
}
