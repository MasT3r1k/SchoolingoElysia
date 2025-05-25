import { Generated } from "kysely";

export interface school_breaksTable {
  breakId: Generated<number>;
  schoolId: number;
  name: string;
  startTime: string; // 'HH:mm:ss'
  endTime: string;   // 'HH:mm:ss'
  dayOfWeek: number; // 1-7 (Monday-Sunday)
}
