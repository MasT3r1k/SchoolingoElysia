import { Generated } from "kysely";

export interface fleetvehicles_maintenanceTable {
  fvmaId: Generated<number>;
  vehicleId: number;
  maintenance_date: Date;
  description: string;
  cost: number;
  mileage_at_service: number | null;
  notes: string;
  createdBy: number;
}