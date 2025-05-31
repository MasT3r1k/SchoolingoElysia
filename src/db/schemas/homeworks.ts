import { Generated } from "kysely";

export interface homeworksTable {
  homeworkId: Generated<number>;
  subjectId: number;
  description: string;
  due_date: Date | null;
  assigned_at: Generated<Date>;
  teacherId: number;
}
