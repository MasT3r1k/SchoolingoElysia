import { Generated } from "kysely";

export interface school_yearsTable {
  syId: Generated<number>;
  start: Date;
  end: Date;
  midterm: Date;
  current: Generated<boolean>;
}