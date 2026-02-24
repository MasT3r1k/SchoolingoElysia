import { Generated } from "kysely";

export interface role_communication_permissionsTable {
  permission_id: Generated<number>;
  role_source: string;
  role_target: string;
}
