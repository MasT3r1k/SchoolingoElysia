import { Generated } from "kysely";

export interface notificationsTable {
  notification_id: Generated<number>;
  user_id: number;
  type: string;
  data: Generated<string>;
  action: Generated<string>;
  read_at: Generated<Date | null>;
  confirmed_at: Generated<Date | null>;
  created_at: Generated<Date>;
}