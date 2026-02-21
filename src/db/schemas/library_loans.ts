import { Generated } from "kysely";

export interface library_loansTable {
  loan_id: Generated<number>;
  copy_id: number;
  reader_id: number;
  loan_date: Generated<Date>;
  due_date: Date;
  return_date: Generated<Date | null>;
  status: 'ongoing' | 'returned' | 'late' | 'lost';
  notes: string;
}