import { Generated } from "kysely";

export interface payments_paymentsTable {
  payment_id: Generated<number>;
  person_id: number;
  payment_column_id: number;
  amount_paid: number; // decimal(10,2) jako string
  paid_at: Generated<Date>;
  payment_method: Generated<'cash' | 'card' | 'bank_transfer' | 'other'>;
  notes: Generated<string | null>;
  created_at: Generated<Date>;
}