import { Generated } from "kysely";

export interface payments_classesTable {
  payment_class_id: Generated<number>;
  class_id: number;
  balance: number;
}
