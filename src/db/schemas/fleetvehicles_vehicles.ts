import { Generated } from "kysely";

export interface fleetvehicles_vehiclesTable {
  vehicleId: Generated<number>;
  vin: string | null;
  manufacture: string;
  model: string;
  countryId_manufacture: number;
  year_manufacture: number;
  fuel: 'petrol' | 'diesel' | 'hybrid(petrol)' | 'hybrid(diesel)' | 'electro' | 'CNG' | 'LNG' | 'LPG' | 'H2';
  plate: string;
  registration_countryId: number;
  mileage: number;
  last_service_date: Date | null;
  periodic_maintenance_mileage: number;
  location: string | null;
  notes: string | null;
}