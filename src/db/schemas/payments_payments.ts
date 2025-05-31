import { Generated } from "kysely";

export interface payments_paymentsTable {
  paymentId: Generated<number>;
  payerId: number;
  paymentColumnId: number;
  amountPaid: string; // decimal(10,2) jako string
  paidAt: Generated<Date>;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'other';
  notes: string | null;
}