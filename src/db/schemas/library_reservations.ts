import { Generated } from "kysely";

export interface library_reservationsTable {
  reservationId: Generated<number>;
  copyId: number;
  reserverId: number;
  reservationDate: Generated<Date>;
  status: 'active' | 'cancelled' | 'fulfilled';
}