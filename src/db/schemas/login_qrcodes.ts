import { Generated } from "kysely";

export interface login_qrcodesTable {
  qrcode: string;
  socket: string;
  userAgent: string;
  ip: Generated<string | null>
  created: Generated<Date>;
}