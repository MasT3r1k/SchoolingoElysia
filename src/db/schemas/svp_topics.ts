import { Generated } from "kysely";

export interface SvpTopicsTable {
  svp_topic_id: Generated<number>;
  svp_subject_id: number;
  name: string;
  description: string | null;
  outcomes: string | null;
  hours_allocated: number | null;
}
