import { ColumnType, Generated } from 'kysely';

export interface AnalyticsVisitsTable {
  id: Generated<number>;
  user_id: number | null;
  visitor_id: string; // UUID token for non-logged users
  url: string;
  path: string;
  method: string;
  ip_address: string | null;
  user_agent: string | null;
  timestamp: ColumnType<Date, string | undefined, never>;
  duration: number | null; // seconds
}
