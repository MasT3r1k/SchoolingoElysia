import { Generated } from "kysely";

export interface role_communication_permissionsTable {
  permission_id: Generated<number>;
  role_source: string;
  role_target: string;
  // If we need granularity like "can only message own class", we might need more fields.
  // For now, let's stick to simple role-to-role permissions.
}
