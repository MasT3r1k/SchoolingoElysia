import { Generated } from "kysely";

export interface homeworkTable {
  homework_id: Generated<number>;
  subject_id: number;
  group_id: number;
  teacher_id: number;
  assigned_at: Generated<Date>;
  due_date: Date | null;
  headline: string | null;
  homework: string;
  note: string | null;
  type: number;
}
