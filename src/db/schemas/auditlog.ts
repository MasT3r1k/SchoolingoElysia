import { ColumnType, Generated } from 'kysely';

export interface AuditlogTable {
  audit_id: Generated<number>;
  user_id: Generated<number | null>;
  type:
    | 'reset_password'
    | 'change_password'
    | 'activated_2FA'
    | 'deactivated_2FA'
    | 'refresh_backup_codes'
    | 'added_passkey'
    | 'removed_passkey'
    | 'created_group'
    | 'removed_group'
    | 'edited_group'
    | 'backup_created'
    | 'backup_restored'
    | 'backup_deleted'
  data: string;
  ip: string | null;
  created: ColumnType<Date, string | undefined, never>;
}
