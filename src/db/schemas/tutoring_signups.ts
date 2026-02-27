import { Generated } from "kysely";

export interface TutoringSignupsTable {
  signup_id: Generated<number>;
  session_id: number;
  student_id: number;
  signed_up_at: Generated<Date>;
}
