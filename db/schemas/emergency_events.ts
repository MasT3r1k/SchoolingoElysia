import { Generated } from "kysely";

export interface emergency_eventsTable {
  eev_id: Generated<number>;
  type_id: number | null;
  description: string | null;
  location: string | null;
  reported_by: number;
  status: 'active' | 'resolved' | 'false_alarm';
  created_at: Generated<Date>;
  resolved_at: Date | null;
}