import { Generated } from "kysely";

export interface library_loansTable {
  loanId: Generated<number>;
  copyId: number;
  borrowerId: number;
  loanDate: Generated<Date>;
  dueDate: Date;
  returnDate: Date | null;
  status: 'ongoing' | 'returned' | 'late' | 'lost';
}