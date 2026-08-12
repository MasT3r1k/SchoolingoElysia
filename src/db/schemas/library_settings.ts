import { Generated } from "kysely";

export interface library_settingsTable {
  setting_id: Generated<number>;
  fee_period: 'monthly' | 'half_year' | 'yearly';
  fee_amount: string;
  late_fee_per_day: string;
  damage_fee: string;
}
