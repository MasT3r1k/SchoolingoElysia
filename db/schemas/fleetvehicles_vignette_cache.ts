import { Generated } from "kysely";

export interface fleetvehicles_vignette_cacheTable {
  vehicleId: number;
  vignette_year: number;
  vignette_expiration: Date | null;
  vignette_type: string | null;
  vignette_number: string | null;
  cached_at: Generated<Date>;
}