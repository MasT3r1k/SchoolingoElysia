import { Generated } from "kysely";

export interface library_book_ratingsTable {
  rating_id: Generated<number>;
  book_id: number;
  reader_id: number;
  rating: number;
  review_text: string | null;
  created_at: Generated<Date>;
}
