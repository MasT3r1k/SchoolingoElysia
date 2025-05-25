import { Generated } from "kysely";

export interface passwordsTable {
  passwordId: Generated<number>;
  personId: number;
  hash: string;
  created_at: Generated<Date>;
  expires_at: Date | null;
}