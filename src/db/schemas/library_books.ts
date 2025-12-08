import { Generated } from "kysely";

export interface library_booksTable {
  bookId: Generated<number>;
  title: string;
  author: string;
  isbn: string | null;
  publisher: string | null;
  published_year: number | null;
  description: string | null;
  coverUrl: string | null;
  genreId: number | null;
  language: string | null;
  pages: number | null;
  createdAt: Generated<Date>;
}
