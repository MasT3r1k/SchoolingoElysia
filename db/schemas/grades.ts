import { Generated } from "kysely";

export interface gradesTable {
  gradeId: Generated<number>;
  studentId: number;
  subjectId: number;
  grade_value: number;
  grade_date: Generated<Date>;
  description: string | null;
  teacherId: number;
}