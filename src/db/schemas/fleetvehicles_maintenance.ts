import { Generated } from "kysely";

export interface fleetvehicles_maintenanceTable {
  fv_ma_id: Generated<number>;
  vehicle_id: number;
  maintenance_date: Date;
  description: string;
  cost: number;
  mileage_at_service: number | null;
  notes: string;
  created_by: number;
}