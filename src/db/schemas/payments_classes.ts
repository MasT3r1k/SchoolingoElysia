import { Generated } from "kysely";

export interface payments_classesTable {
  paymentClassId: Generated<number>;
  name: string;
  description: string | null;
  created_at: Generated<Date>;
}
