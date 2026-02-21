import { Generated } from "kysely";

export interface insurance_companiesTable {
  insurance_id: Generated<number>;
  insurance: string;
  shortcut: string | null;
}