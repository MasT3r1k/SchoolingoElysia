import { Generated } from "kysely";

export interface BuildingsTable {
  building_id: Generated<number>;
  school_id: number;
  name: string;
  type: 'school' | 'canteen' | 'workshop' | 'other';
}