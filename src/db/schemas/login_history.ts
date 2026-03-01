import { Generated } from "kysely";

export interface login_historyTable {
  login_id: Generated<number>;
  user_id: number | null;
  type: 'password' | 'qrcode' | 'passkey';
  success: boolean;
  error: string | null;
  ip: string | null;
  token_id: Generated<number | null>;
  user_agent: string | null;
  created: Generated<Date>;
  city: string | null;
  zip_code: string | null;
  region_name: string | null;
  country: string | null;
  country_code: string | null;
  continent: string | null;
  continent_code: string | null;
}
