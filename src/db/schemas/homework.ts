import { Generated } from "kysely";

export interface homeworkTable {
  homeworkId: Generated<number>;
  subjectId: number;
  groupId: number;
  teacherId: number;
  assigned_at: Generated<Date>;
  due_date: Date | null;
  homework: string;
  type: number;
}
