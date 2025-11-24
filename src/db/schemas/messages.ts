import { Generated } from "kysely";

export interface messagesTable {
  message_id: Generated<number>;
  type: number;
  topic: Generated<string | null>;
  message: string;
  author_id: number;
  sent_at: Generated<Date>;
  deleted: Generated<boolean>;
  require_confirm: Generated<boolean>;
}