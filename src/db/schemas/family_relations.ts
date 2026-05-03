import { Generated } from "kysely";

export interface family_relationsTable {
  family_relation_id: Generated<number>;
  source_id: number;
  target_id: number;
  role: 'father' | 'mother' | 'guardian';
  legal_guardian_de_jure: Generated<boolean>;
  closest_legal_representative: Generated<boolean>;
  allowed_to_receive_information: Generated<boolean>;
}
