import { Generated } from 'kysely';

export interface SystemHeartbeatsTable {
  heartbeat_id: Generated<number>;
  recorded_at: Generated<Date>;
  version: string;
  commit_hash: string;
  is_update: number;
  note: string | null;
}
