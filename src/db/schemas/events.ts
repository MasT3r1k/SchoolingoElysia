import { Generated } from "kysely";

export interface EventsTable {
  event_id: Generated<number>
  event_name: string;
  event_description: string | null;
  event_date: string | Date;
  event_type: string;
  class_id: number | null;
  created_by: number | null;
  created_time: Generated<Date>;
}