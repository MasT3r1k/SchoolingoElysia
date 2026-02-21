import { Generated } from "kysely";

export interface InventoryLogsTable {
  log_id: Generated<number>;
  inventory_id: number;
  person_id: number;
  from_room_id: Generated<number | null>;
  to_room_id: Generated<number | null>;
  action: Generated<'create' | 'move' | 'update_status' | 'delete'>;
  note: Generated<string | null>;
  created_at: Generated<Date>;
}
