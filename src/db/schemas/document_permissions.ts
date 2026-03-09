import { Generated } from "kysely";

export interface document_permissionsTable {
  document_permission_id: Generated<number>;
  document_id: number;
  role_id: number | null;
  user_id: number | null;
  permission_type: 'READ' | 'WRITE' | 'DENY';
  created_at: Generated<Date | null>;
}
