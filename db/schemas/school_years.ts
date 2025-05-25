import { Generated } from "kysely";

export interface school_yearsTable {
  syId: Generated<number>;
  schoolId: number;
  start: String;
  end: String;
  midterm: String;
}