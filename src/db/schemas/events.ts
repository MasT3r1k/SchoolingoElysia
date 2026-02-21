import { Generated } from "kysely";

export interface EventsTable {
  event_id: Generated<number>
  event_name: string;
  event_description: Generated<string | null>;
  event_type: Generated<string>;
  created_by: Generated<number | null>;
  created_time: Generated<Date>;
}