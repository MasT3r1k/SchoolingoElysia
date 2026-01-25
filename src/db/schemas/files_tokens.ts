import { Generated } from "kysely";

export interface filesTokensTable {
  token_id: Generated<number>;
  file_id: number;
  access_token: string;
  created_at: Generated<Date>;
  expire_at: Generated<Date>;
  token_owner: number;
  used_count: Generated<number>;
}
