import { Generated } from "kysely";

export interface ThematicPlansTable {
  thematic_plan_id: Generated<number>;
  teacher_id: number;
  group_id: number;
  subject_id: number;
  svp_subject_id: number | null;
  school_year_id: number;
  name: string;
  created_at: Generated<Date>;
}
