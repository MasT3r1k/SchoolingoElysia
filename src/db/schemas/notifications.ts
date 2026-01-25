import { Generated } from "kysely";

export interface notificationsTable {
  notification_id: Generated<number>;
  user_id: number;
  type: string;
  data: Generated<string>;
  url: Generated<string>;
  read_at: Generated<Date | null>;
  created_at: Generated<Date>;
}