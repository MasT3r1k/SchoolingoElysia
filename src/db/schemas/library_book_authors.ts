import { Generated } from "kysely";

export interface library_book_authorsTable {
  bookAuthorId: Generated<number>;
  bookId: number;
  authorName: string;
  birthYear: number | null;
  deathYear: number | null;
}