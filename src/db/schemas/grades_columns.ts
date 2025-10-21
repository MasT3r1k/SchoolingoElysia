import { Generated } from "kysely";

export interface grades_columnsTable {
  gcId: Generated<number>;
  groupId: number;
  subjectId: number;
  columnIndex: number;
  weight: number;
  type: number;
  topic: string;
  created: Generated<Date>;
  status: 'active' | 'deleted'
}