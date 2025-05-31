import { Generated } from "kysely";

export interface CountriesTable {
  countryId: Generated<number>;
  nationality: string;
  code2: string;
  code3: string;
  phoneCode: number;
}