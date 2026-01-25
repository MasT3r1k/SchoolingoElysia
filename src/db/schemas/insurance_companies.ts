import { Generated } from "kysely";

export interface insurance_companiesTable {
  insuranceId: Generated<number>;
  insurance: string;
  shortcut: string | null;
}