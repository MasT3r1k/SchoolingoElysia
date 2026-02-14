import { Generated } from "kysely";

export interface login_historyTable {
  loginId: Generated<number>;
  userId: number;
  type: 'password' | 'qrcode' | 'passkey';
  success: boolean;
  error: string | null;
  ip: string | null;
  token_id: Generated<number | null>;
  userAgent: string | null;
  created: Generated<Date>;
  city: string | null;
  zip_code: string | null;
  region_name: string | null;
  country: string | null;
  country_code: string | null;
  continent: string | null;
  continent_code: string | null;
}
