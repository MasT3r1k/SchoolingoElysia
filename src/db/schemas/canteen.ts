import { Generated } from "kysely";

export type CanteenMealCategory = 'meat' | 'veg' | 'sweet' | 'other';
export type CanteenOrderStatus = 'ordered' | 'issued' | 'cancelled';

export interface CanteenAccountsTable {
  canteen_account_id: Generated<number>;
  account_id: number;
  person_id: number;
}

export interface CanteenMealsTable {
  meal_id: Generated<number>;
  name: string;
  category: Generated<CanteenMealCategory>;
  price: Generated<string>; // decimal
  calories: number | null;
  allergens: string | null; // čárkou oddělený seznam, JSON, nebo text
  created_by: number; // FK do users
  created_at: Generated<Date>;
  deleted_at: Date | null;
}

export interface CanteenMenusTable {
  menu_id: Generated<number>;
  date: Date | string; // DATE
  variant_index: number; // 1 = Oběd 1, 2 = Oběd 2...
  meal_id: number; // FK do canteen_meals
  limit_count: number | null;
  created_by: number; // FK do users
  created_at: Generated<Date>;
}

export interface CanteenOrdersTable {
  order_id: Generated<number>;
  person_id: number; // FK do persons
  menu_id: number; // FK do canteen_menus
  status: Generated<CanteenOrderStatus>;
  payment_transfer_id: number | null; // FK do payments_transfers
  ordered_at: Generated<Date>;
  issued_at: Date | null;
  cancelled_at: Date | null;
}

export interface CanteenSettingsTable {
  key: string;
  value: string;
}
