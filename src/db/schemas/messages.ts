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
  excuse_date_from: Generated<Date | null>;
  excuse_date_to: Generated<Date | null>;
  excuse_hour_from: Generated<number | null>;
  excuse_hour_to: Generated<number | null>;
  excuse_all_day: Generated<boolean | null>;
  message_rating_type: number | null;
}