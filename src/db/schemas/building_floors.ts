import { Generated } from "kysely";

export interface Building_floorsTable  {
  bf_id: Generated<number>;
  building_id: number;
  level: number;
  floor_plan: string | null;
}
