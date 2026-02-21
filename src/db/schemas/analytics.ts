import { ColumnType, Generated } from 'kysely';

export interface AnalyticsVisitsTable {
  id: Generated<number>;
  user_id: Generated<number | null>;
  visitor_id: string; // UUID token for non-logged users
  url: string;
  path: string;
  method: string;
  ip_address: Generated<string | null>;
  user_agent: Generated<string | null>;
  timestamp: Generated<ColumnType<Date, string | undefined, never>>;
  duration: Generated<number | null>; // seconds
}
