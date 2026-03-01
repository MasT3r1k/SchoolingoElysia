import { Generated } from "kysely";

export interface messages_draftsTable {
  draft_id: Generated<number>;
  author_id: number;
  type: number;
  topic: string | null;
  message: string;
  receivers: string | null; // JSON string
  require_confirm: Generated<boolean>;
  updated_at: Generated<Date>;
}
