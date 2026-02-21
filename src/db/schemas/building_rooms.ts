import { Generated } from "kysely";

export interface Building_roomsTable {
  room_id: Generated<number>;
  floor_id: number;
  name: string;
  type: Generated<string>; // @default 'classroom'
  description: Generated<string | null>;
  manager_id: number;
  capacity: Generated<number>;
  pos_x: number;
  pos_y: number;
}