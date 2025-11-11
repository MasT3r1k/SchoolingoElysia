import { Generated } from "kysely";

export interface Traineeship_instructorsTable {
  instructorId: Generated<number>
  companyId: number
  firstname: string;
  lastname: string;
  email: string | null
  phone: string | null
  role: string | null
  status: 'active' | 'deleted'
  addedBy: number | null
  created: Date;
  last_updated: Date;
}