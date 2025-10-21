import { Generated } from "kysely";

export interface gradesTable {
  gradeId: Generated<number>;
  columnId: number;
  mark: number;
  studentId: number;
  teacherId: number;
}