import { Generated } from "kysely";

export interface payments_columnsTable {
  payment_column_id: Generated<number>;
  payment_class_id: number;
  name: string;
  description: string;
  date: Generated<Date>;
  due_date: Generated<Date | null>;
  amount: number;
  created_by: number;
}
