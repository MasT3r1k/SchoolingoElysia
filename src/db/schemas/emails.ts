import { Generated } from "kysely";

export interface emailsTable {
  email: string
  personId: number
  type: 'personal' | 'school' | 'work' | 'other';
  description: string | null
  is_verified: boolean;
  email_code: Generated<string | null>;
  code_until: Generated<Date | null>;
}