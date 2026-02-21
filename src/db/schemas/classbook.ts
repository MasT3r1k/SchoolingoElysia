import { Generated } from "kysely";

export interface ClassbookTable {
  classbook_id: Generated<number>;
  date: Date | string;
  day_hour: number;
  subject_id: Generated<number | null>;
  teacher_id: Generated<number | null>;
  group_id: number;
  room_id: Generated<number | null>;
  topic: Generated<string | null>;
  note: Generated<string | null>;
  internal_note: Generated<string | null>;
}