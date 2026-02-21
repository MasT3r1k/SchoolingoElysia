import { Generated } from "kysely";

export interface school_yearsTable {
  sy_id: Generated<number>;
  school_id: number;
  start: Date;
  end: Date;
  midterm: Date;
  current: Generated<boolean>;
}