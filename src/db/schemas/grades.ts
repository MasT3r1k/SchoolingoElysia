import { Generated } from "kysely";

export interface gradesTable {
  grade_id: Generated<number>;
  column_id: number;
  mark: number;
  student_id: number;
  teacher_id: number;
}