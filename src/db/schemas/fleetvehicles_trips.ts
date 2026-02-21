import { Generated } from "kysely";

export interface fleetvehicles_tripsTable {
  trip_id: Generated<number>;
  vehicle_id: number;
  driver_id: number;
  start_date: Generated<Date>;
  end_date: Date | null;
  purpose: string;
  start_location: string;
  end_location: string;
  distance: number;
  notes: string;
}
