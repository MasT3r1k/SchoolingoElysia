import { Generated } from "kysely";

export interface family_relationsTable {
  family_relation_id: Generated<number>;
  source_id: number;
  target_id: number;
  role: 'father' | 'mother' | 'uncle' | 'aunt' | 'grandfather' | 'grandmother' | 'stepfather' | 'stepmother' | 'guardian';
}
