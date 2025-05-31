import { Generated } from "kysely";

export interface payments_columnsTable {
  paymentColumnId: Generated<number>;
  paymentClassId: number;
  name: string;
  amount: string; // decimal(10,2) jako string
  dueDate: Date;
}
