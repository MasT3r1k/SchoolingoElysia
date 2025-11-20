import { Generated } from "kysely";

export interface school_yearsTable {
  syId: Generated<number>;
  schoolId: number;
  start: Date;
  end: Date;
  midterm: Date;
}