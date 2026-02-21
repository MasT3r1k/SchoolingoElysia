import { Generated } from "kysely";

export interface SupervisionsTable {
  supervision_id: Generated<number>;
  teacher_id: number;
  place_id: number;
  day: number;
  hour: number;
  description: string | null;
}
