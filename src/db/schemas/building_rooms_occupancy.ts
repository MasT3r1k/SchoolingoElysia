import { Generated } from "kysely";

export interface Building_rooms_occupancyTable {
  bro_id: Generated<number>;
  event_id: number;
  room_id: number;
  person_id: number;
  time: string; // timestamp, can be Date or string
}