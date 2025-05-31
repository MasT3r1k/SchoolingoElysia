import { Generated } from "kysely";

export interface insurance_companiesTable {
  insuranceCompanyId: Generated<number>;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
}