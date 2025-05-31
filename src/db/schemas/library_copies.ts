import { Generated } from "kysely";

export interface library_copiesTable {
  copyId: Generated<number>;
  bookId: number;
  copyNumber: number;
  shelfLocation: string | null;
  status: 'available' | 'checked_out' | 'reserved' | 'lost' | 'damaged';
  condition: string | null;
}