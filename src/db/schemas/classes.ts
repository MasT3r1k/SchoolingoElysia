import { Generated } from "kysely";

export interface ClassesTable {
  classId: Generated<number>;              // PK
  prefix: string;
  suffix: string;
  yearId?: number | null;
  teacher: number;
  room: number;
  scopeId: number;
}