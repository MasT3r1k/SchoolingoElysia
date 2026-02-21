import { Generated } from "kysely";

export interface DegreesTable {
  degree_id: Generated<number>;
  degree: string;
  shortcut: string;
  is_before: boolean;
  weight: number;
}