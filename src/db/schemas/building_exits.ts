import { Generated } from "kysely";

export interface Building_exitsTable {
  be_id: Generated<number>;
  floor_id: number;
  type: 'main' | 'emergency';
  pos_x: number;
  pos_y: number;
}