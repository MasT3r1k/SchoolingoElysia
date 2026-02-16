import { Generated } from "kysely";

export interface SupervisionsTable {
  supervisionId: Generated<number>;
  teacherId: number;
  placeId: number;
  day: number;
  hour: number;
  description: string | null;
}
