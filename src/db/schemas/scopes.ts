import { Generated } from "kysely";

export interface ScopesTable {
  scopeId: Generated<number>
  name: string;
  shortcut: string;
  code: string;
  years: number;
  students_per_class: number;
  number_of_classes: number;
}