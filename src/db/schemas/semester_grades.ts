import { Generated } from "kysely";

export interface semester_gradesTable {
  s_g_id: Generated<number>;
  student_id: number;
  subject_id: number;
  year: number;
  semester: number;
  grade: Generated<string | number | null>;
  verbal_assessment: Generated<string | null>;
  teacher_id: Generated<number | null>;
  finalized: Generated<boolean>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}