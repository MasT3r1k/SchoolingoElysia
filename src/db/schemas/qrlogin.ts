import { Generated } from "kysely";

export interface qrloginTable {
  qrLoginId: Generated<number>;
  personId: number;
  qrCode: string;
  createdAt: Generated<Date>;
  expiresAt: Date;
  usedAt: Date | null;
}