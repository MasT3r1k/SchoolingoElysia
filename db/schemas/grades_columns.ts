import { Generated } from "kysely";

export interface grades_columnsTable {
  columnId: Generated<number>;
  subjectId: number;
  name: string;
  weight: number;
  created_at: Generated<Date>;
}