import { Generated } from "kysely";

export interface pushSubscriptionsTable {
  subscription_id: Generated<number>;
  user_id: number;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: Generated<Date>;
}
