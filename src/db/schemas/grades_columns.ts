import { Generated } from "kysely";

export interface grades_columnsTable {
  column_id: Generated<number>;
  group_id: number;
  subject_id: number;
  column_index: number;
  weight: number;
  max_points: Generated<number | null>;
  type: number;
  topic: string;
  created: Generated<Date>;
  status: 'active' | 'deleted'
}