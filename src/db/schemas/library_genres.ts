import { Generated } from "kysely";

export interface library_genresTable {
  genreId: Generated<number>;
  genreName: string;
  description: string | null;
}