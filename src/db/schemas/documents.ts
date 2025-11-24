import { Generated } from "kysely";

export interface documentsTable {
  file_id: Generated<number>;
  parent_id: Generated<number | null>;
  type: Generated<'file' | 'folder'>;
  name: string;
  real_file_name: Generated<string | null>;
  file_format: Generated<string | null>;
  mime_type: Generated<string | null>;
  file_size: Generated<number>;
  storage_path: Generated<string | null>;
  thumbnail_path: Generated<string | null>;
  permissions: string;
  owner_id: number;
  checksum: Generated<string | null>;
  is_deleted: Generated<boolean>;
  deleted_at: Generated<Date | null>;
  last_accessed_at: Generated<Date | null>;
  modified_at: Generated<Date>;
  created_at: Generated<Date>;
}