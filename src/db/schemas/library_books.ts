import { Generated } from "kysely";

export interface library_booksTable {
  book_id: Generated<number>;
  title: string;
  year_publication: number;
  genre_id: number;
  isbn: Generated<string | null>;
  publisher: Generated<string | null>;
  published_year: Generated<number | null>;
  edition_number: number;
  pages: Generated<number>;
  annotation: Generated<string | null>;
  tags: Generated<string | null>;
  keywords: Generated<string | null>;
  signature: Generated<string | null>;
  language: Generated<string | null>;
  description: Generated<string | null>;
  cover_url: Generated<string | null>;
  created_at: Generated<Date>;
}
