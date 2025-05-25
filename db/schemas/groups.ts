import { Generated } from "kysely";

export interface groupsTable {
  groupId: Generated<number>;
  name: string;
  num: number;
  class: number;
  year: number;
}