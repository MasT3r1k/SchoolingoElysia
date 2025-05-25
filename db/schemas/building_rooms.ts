import { Generated } from "kysely";

export interface Building_roomsTable {
  br_id: Generated<number>;
  floor_id: number;
  name: string;
  type: string; // default 'classroom' by DB
  pos_x: number;
  pos_y: number;
}