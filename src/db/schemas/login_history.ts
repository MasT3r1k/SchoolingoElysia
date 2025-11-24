import { Generated } from "kysely";

export interface login_historyTable {
  loginId: Generated<number>;
  userId: number;
  type: 'password' | 'qrcode' | 'passkey';
  success: boolean;
  error: string | null;
  ip: string | null;
  token_id: Generated<number | null>;
  userAgent: string;
  created: Generated<Date>;
  city: Generated<string>;
  zip_code: Generated<string>;
  region_name: Generated<string>;
  country: Generated<string>;
  country_code: Generated<string>;
  continent: Generated<string>;
  continent_code: Generated<string>;
}
