import { Generated } from "kysely";

export interface CountriesTable {
  country_id: Generated<number>;
  nationality: string;
  code2: string;
  code3: string;
  phone_code: number;
}