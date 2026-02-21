import { Generated } from "kysely";

export interface login_qrcodesTable {
  qrcode: string;
  socket: string;
  user_agent: string;
  ip: Generated<string | null>
  created: Generated<Date>;
}