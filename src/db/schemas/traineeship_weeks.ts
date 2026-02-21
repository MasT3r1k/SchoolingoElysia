import { Generated } from "kysely";

export interface Traineeship_weeksTable {
  tr_week_id: Generated<number>
  group_id: number
  name: string;
  start: Date
  end: Date
  ignored_days: Generated<string | null>
  state: Generated<'active' | 'canceled'>
}