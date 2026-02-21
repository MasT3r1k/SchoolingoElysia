import { Generated } from "kysely";

export interface SupervisionPlacesTable {
  place_id: Generated<number>;
  school_id: number;
  name: string;
  description: string | null;
}
