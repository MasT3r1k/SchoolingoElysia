import { Generated } from "kysely";

export interface EventsTable {
  event_id: Generated<number>
  event_name: string;
  event_description?: string;
  created_by: number;
  created_time: Generated<Date>;
}