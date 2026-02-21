import { Generated } from "kysely";

export interface library_copiesTable {
  copy_id: Generated<number>;
  book_id: number;
  barcode: Generated<string | null>;
  acquisition_date: Date;
  condition: Generated<'new' | 'very_good' | 'good' | 'worn' | 'very_worn' | 'damaged'>;
  status: Generated<'available' | 'checked_out' | 'reserved' | 'lost' | 'damaged'>;
  copy_number: number;
  location: Generated<string | null>;
  notes: Generated<string>;
}