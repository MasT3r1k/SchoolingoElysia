import { Generated } from "kysely";

export interface documentsTable {
  document_id: Generated<number>;
  parent_id: Generated<number | null>;
  type: Generated<'file' | 'folder'>;
  name: Generated<string | null>;
  file_id: Generated<number | null>;
  created_at: Generated<Date | null>;
}