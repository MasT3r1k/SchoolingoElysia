import { Generated } from "kysely";

export interface groupsTable {
  group_id: Generated<number>;
  name: string;
  num: number;
  class_id: number;
  year_id: number;
}