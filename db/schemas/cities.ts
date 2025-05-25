import { Generated } from "kysely";

export interface CitiesTable {
  cityId: Generated<number>;
  cityName: string;
  countryId: number;
  postcode: string | null;
}