import { Generated } from "kysely";

export interface family_relationsTable {
  frId: Generated<number>;
  source: number;
  target: number;
  role: 'father' | 'mother' | 'uncle' | 'aunt' | 'grandfather' | 'grandmother' | 'stepfather' | 'stepmother' | 'guardian';
}
