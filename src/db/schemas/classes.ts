import { Generated } from "kysely";

export interface ClassesTable {
  class_id: Generated<number>;
  prefix: string;
  suffix: string;
  year_id: Generated<number | null>;
  teacher_id: number;
  room_id: number;
  scope_id: number;
}