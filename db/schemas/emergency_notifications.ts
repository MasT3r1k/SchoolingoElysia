import { Generated } from "kysely";

export interface emergency_notificationsTable {
  en_id: Generated<number>;
  event_id: number;
  person_id: number;
  channel: 'email' | 'sms' | 'push' | 'call';
  sent_at: Generated<Date>;
  status: string;
}