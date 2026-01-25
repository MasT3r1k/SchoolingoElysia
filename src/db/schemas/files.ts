import { Generated } from "kysely";

export interface filesTable {
  file_id: Generated<number>;
  file_uuid: string;
  name: string;
  real_file_name: Generated<string | null>;
  origin: Generated<string | null>;
  file_format: Generated<string | null>;
  mime_type: Generated<string | null>;
  file_size: Generated<number>;
  storage_path: Generated<string | null>;
  thumbnail_path: Generated<string | null>;
  permissions: Generated<string>;
  owner_id: Generated<number | null>;
  checksum: Generated<string | null>;
  deleted_at: Generated<Date | null>;
  last_accessed_at: Generated<Date | null>;
  modified_at: Generated<Date | null>;
  created_at: Generated<Date | null>;
}
