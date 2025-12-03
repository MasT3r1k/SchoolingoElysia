import { Generated } from "kysely";

export interface notificationRulesTable {
  rule_id: Generated<number>;
  user_id: number;
  type: string;
  conditions: string;
  enabled: boolean;
}
