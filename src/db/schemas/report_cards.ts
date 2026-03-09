import { Generated } from "kysely";

export interface ReportCardsTable {
  rc_id: Generated<number>;
  student_id: number;
  year: number; // e.g. 2025
  semester: number; // 1 or 2 (maps to DB semester 2 or 4)
  issued_at: Date | string;
  issued_by: number | null; // person_id of teacher/admin
  created_at: Generated<Date | string>;
  updated_at: Generated<Date | string>;
}
