import { Generated } from "kysely";

export interface fleetvehicles_vignette_cacheTable {
  fv_vc_id: Generated<number>;
  vehicle_id: number;
  country_id: number;
  valid_since: Generated<Date | null>;
  valid_until: Generated<Date | null>;
  cache_last_update: Generated<Date>;
}