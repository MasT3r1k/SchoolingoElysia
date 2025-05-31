import { Generated } from "kysely";

export interface emergency_event_typesTable {
  eet_id: Generated<number>;
  code: string;
  color: string | null;
  icon: string | null;
}