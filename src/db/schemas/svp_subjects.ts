import { Generated } from "kysely";

export interface SvpSubjectsTable {
  svp_subject_id: Generated<number>;
  svp_id: number;
  subject_id: number;
  grade: number; // 1-9
}
