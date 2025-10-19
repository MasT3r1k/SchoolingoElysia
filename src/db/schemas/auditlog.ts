import { ColumnType, Generated } from 'kysely';

export interface AuditlogTable {
  auditId: Generated<number>;
  userId: number;
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
  data: { [key: string]: string };
  ip: string | null;
  created: ColumnType<Date, string | undefined, never>;
}
