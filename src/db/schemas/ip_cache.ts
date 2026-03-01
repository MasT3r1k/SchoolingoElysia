import { Generated } from "kysely";

export interface ip_cacheTable {
  ip: string;
  city: string | null;
  zip_code: string | null;
  region_name: string | null;
  country: string | null;
  country_code: string | null;
  continent: string | null;
  continent_code: string | null;
  created: Generated<Date>;
}
