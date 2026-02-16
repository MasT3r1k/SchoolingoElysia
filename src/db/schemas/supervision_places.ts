import { Generated } from "kysely";

export interface SupervisionPlacesTable {
  placeId: Generated<number>;
  name: string;
  description: string | null;
}
