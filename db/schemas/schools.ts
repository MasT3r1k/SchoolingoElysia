import { Generated } from "kysely";

export interface schoolsTable {
  schoolId: Generated<number>;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
}