import { Generated } from "kysely";

export interface SchoolEvaluationTemplatesTable {
  template_id: Generated<number>;
  school_id: number;
  type: string;
  text: string;
  value: 'praise' | 'note';
  is_public: Generated<boolean>;
  created_by: number;
  created_at: Generated<Date>;
}
