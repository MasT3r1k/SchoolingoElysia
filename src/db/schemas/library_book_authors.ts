import { Generated } from "kysely";

export interface library_book_authorsTable {
  book_author_id: Generated<number>;
  book_id: number;
  author_id: number;
}