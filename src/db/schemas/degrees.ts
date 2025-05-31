import { Generated } from "kysely";

export interface DegreesTable {
  degreeID: Generated<number>;
  degree: string;
  shortcut: string;
  isBefore: boolean;
  weight: number;
}