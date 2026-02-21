import { Generated } from "kysely";

export interface ScopesTable {
  scope_id: Generated<number>
  name: string;
  shortcut: string;
  code: string;
  years: number;
  students_per_class: number;
  number_of_classes: number;
  is_active: Generated<boolean>
  school_id: number
}