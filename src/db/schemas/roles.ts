import { Generated } from "kysely";

export interface RolesTable {
  role_id: Generated<number>;
  role_name: string;
  role_key: string;
  description: string | null;
}
