import { Generated } from "kysely";

export interface InventoryTable {
  inventory_id: Generated<number>;
  school_id: number;
  room_id: Generated<number | null>;
  name: string;
  description: Generated<string | null>;
  serial_number: Generated<string | null>;
  category: Generated<string | null>;
  status: Generated<'active' | 'broken' | 'discarded' | 'maintenance'>;
  acquisition_date: Generated<Date | null>;
  purchase_price: Generated<number | null>;
  created_at: Generated<Date>;
}
