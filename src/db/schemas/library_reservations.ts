import { Generated } from "kysely";

export interface library_reservationsTable {
  reservationId: Generated<number>;
  bookId: number;
  reserverId: number;
  reservationDate: Generated<Date>;
  status: 'pending' | 'cancelled' | 'fulfilled';
}