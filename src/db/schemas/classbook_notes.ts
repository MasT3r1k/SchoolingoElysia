import { Generated } from "kysely";

export interface ClassbookNotesTable {
  classbook_note_id: Generated<number>;
  subject_id: number;
  group_id: number;
  title: Generated<string | null>;
  note: string;
  created_at: Generated<Date>;
  created_by: number;
}