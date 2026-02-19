import { Generated } from "kysely";

export interface SupervisionPlacesTable {
  placeId: Generated<number>;
  school_id: number;
  name: string;
  description: string | null;
}
