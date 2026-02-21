import { Generated } from "kysely";

export interface Traineeship_instructorsTable {
  instructor_id: Generated<number>
  company_id: number
  firstname: string;
  lastname: string;
  email: Generated<string | null>
  phone: Generated<string | null>
  role: Generated<string | null>
  status: Generated<'active' | 'deleted'>
  added_by: Generated<number | null>
  created: Generated<Date>;
  last_updated: Generated<Date>;
}