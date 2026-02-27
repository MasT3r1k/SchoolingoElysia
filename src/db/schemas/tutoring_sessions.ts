import { Generated } from "kysely";

export interface TutoringSessionsTable {
  session_id: Generated<number>;
  school_id: number;
  teacher_id: number;
  subject_id: number | null;
  class_id: number | null;
  title: string;
  description: string | null;
  date: Date;
  room_id: number | null;
  max_students: number | null;
  created_at: Generated<Date>;
}
