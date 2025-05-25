import { Generated } from "kysely";

export interface login_historyTable {
  loginId: Generated<number>;
  personId: number;
  loginDate: Generated<Date>;
  ipAddress: string;
  deviceInfo: string | null;
  logoutDate: Date | null;
}
