import { Generated } from "kysely";

export interface fleetvehicles_tripsTable {
  tripId: Generated<number>;
  vehicleId: number;
  driverId: number;
  start_date: Generated<Date>;
  end_date: Date | null;
  purpose: string;
  start_location: string;
  end_location: string;
  distance: number;
  notes: string;
}
