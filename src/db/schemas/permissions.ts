import { Generated } from "kysely";

export interface PermissionsTable {
  permission_id: Generated<number>;
  permission_name: string;
  description: string | null;
}
