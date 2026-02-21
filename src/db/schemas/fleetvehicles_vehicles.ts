import { Generated } from "kysely";

export interface fleetvehicles_vehiclesTable {
  vehicle_id: Generated<number>;
  vin: Generated<string | null>;
  manufacture: string;
  model: string;
  manufacture_country_id: number;
  year_manufacture: number;
  fuel: 'petrol' | 'diesel' | 'hybrid(petrol)' | 'hybrid(diesel)' | 'electro' | 'CNG' | 'LNG' | 'LPG' | 'H2';
  plate: string;
  registration_country_id: number;
  mileage: number;
  last_service_date: Generated<Date | null>;
  periodic_maintenance_mileage: number;
  location: Generated<string | null>;
  notes: Generated<string | null>;
}