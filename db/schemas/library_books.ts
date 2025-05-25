import { Generated } from "kysely";

export interface library_booksTable {
  bookId: Generated<number>;
  title: string;
  isbn: string | null;
  published_year: number | null;
  publisher: string | null;
  language: string | null;
  pages: number | null;
}
