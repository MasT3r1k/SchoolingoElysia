import { Generated } from "kysely";

export interface SvpTable {
  svp_id: Generated<number>;
  school_id: number;
  name: string;
  valid_from: Date | string;
  valid_to: Date | string | null;
  created_at: Generated<Date>;
}
