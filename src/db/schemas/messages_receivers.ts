import { Generated } from "kysely";

export interface messages_receiversTable {
  message_id: number;
  receiver_id: number;
  read_at: Generated<Date | null>;
  confirmed_at: Generated<Date | null>;
  suppress_at: Generated<Date | null>;
}
