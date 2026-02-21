import { Generated } from "kysely";

export interface CitiesTable {
  city_id: Generated<number>;
  city_name: string;
  country_id: number;
  postcode: string | null;
}