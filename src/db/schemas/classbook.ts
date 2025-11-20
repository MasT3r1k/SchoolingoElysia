import { Generated } from "kysely";

export interface ClassbookTable {
  cbId: Generated<number>;
  date: Date | string;
  dayHour: number;
  subject: number | null;
  teacher: number | null;
  groupId: number;
  room: number | null;
  topic: string | null;
  note: string | null;
  internalNote: string | null;
}