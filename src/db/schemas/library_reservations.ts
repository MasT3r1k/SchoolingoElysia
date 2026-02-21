import { Generated } from "kysely";

export interface library_reservationsTable {
  reservation_id: Generated<number>;
  book_id: number;
  person_id: number;
  reservation_date: Generated<Date>;
  status: 'pending' | 'cancelled' | 'fulfilled';
  created: Generated<Date>;
}