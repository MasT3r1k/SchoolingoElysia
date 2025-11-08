import { Generated } from "kysely";

export interface Traineeship_weeksTable {
  trWeekId: Generated<number>
  groupId: number
  name: string;
  start: Date
  end: Date
  ignoredDays: string | null
  state: 'active' | 'canceled'
}