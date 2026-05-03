import { Generated } from "kysely";

export interface ThematicPlanItemsTable {
  item_id: Generated<number>;
  thematic_plan_id: number;
  item_order: number;
  topic: string;
  description: string | null;
  estimated_date: Date | string | null;
  period: string | null;
}
