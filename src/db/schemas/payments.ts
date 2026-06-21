import { Generated } from "kysely";

export type AccountType = 'bank' | 'cash';

export type FeeStatus = 'paid' | 'pending' | 'cancelled' | 'partially_paid';

export type TransactionType = 'payment' | 'refund' | 'overpayment';

export type PaymentFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface PaymentsAccountsTable {
  payment_account_id: Generated<number>;
  owner_id: number; // FK do persons
  type: Generated<AccountType>;
  name: string;
  balance: Generated<string>; // decimal se v JS/TS typicky vrací jako string kvůli přesnosti
  iban: string | null;
  is_active: Generated<number>; // tinyint(1) -> 0 nebo 1
  created_by: number; // FK do users
  created_at: Generated<Date>;
  deleted_at: Date | null;
}

export interface PaymentsAssignedFeesTable {
  payment_assign_id: Generated<number>;
  payment_fee_id: number;
  person_id: number; // FK do persons
  payer_id: number; // FK do persons
  variable_symbol: string;
  specific_symbol: string;
  constant_symbol: string;
  status: Generated<FeeStatus>;
}

export interface PaymentsAuditlogTable {
  auditlog_id: Generated<number>;
  payment_id: number;
  old_state: Generated<string>; // text s default '{}'
  new_state: Generated<string>; // text s default '{}'
  changed_by: number; // FK do users
  changed_at: Generated<Date>;
}

export interface PaymentsCategoriesTable {
  category_id: Generated<number>;
  category: string;
  created_by: number; // FK do users
  created_at: Generated<Date>;
  deleted_at: Date | null;
}

export interface PaymentsFeesTable {
  payment_fee_id: Generated<number>;
  class_id: number | null; // FK do classes
  name: string;
  category_id: number;
  due_date: Date | string; // MySQL DATE typ
  description: string;
  amount: Generated<string>; // decimal
  reminder_days: Generated<number>;
  is_draft: Generated<number>; // tinyint
  file_id: number; // FK do files
  created_by: number; // FK do users
  created_at: Generated<Date>;
  deleted_at: Date | null;
}

export interface PaymentsFeesMethodTable {
  payment_method_id: Generated<number>;
  method: string;
  created_by: number; // FK do users
  created_at: Generated<Date>;
  deleted_at: Date | null;
}

export interface PaymentsFeesNotificationTable {
  payment_notification_id: Generated<number>;
  notification: string;
  created_by: number; // FK do users
  created_at: Generated<Date>;
  deleted_at: Date | null;
}

export interface PaymentsManagersTable {
  payment_manager_id: Generated<number>;
  payment_account_id: number;
  person_id: number; // FK do persons
  description: string;
  created_by: number; // FK do users
  created_at: Generated<Date>;
}

export interface PaymentsPaymentsTable {
  payment_id: Generated<number>;
  payment_assign_id: number;
  amount: Generated<string>; // decimal
  paid_at: Date | null;
  transaction_type: Generated<TransactionType>;
  payment_method_id: number | null;
  payment_account_id: number | null;
  note: string | null;
  is_auto_paired: Generated<number>; // tinyint
  bank_transaction_id: string | null;
  file_id: number;
  created_at: Generated<Date>;
  deleted_at: Date | null;
}

export interface PaymentsRegularTable {
  payment_regular_id: Generated<number>;
  name: string;
  frequency: Generated<PaymentFrequency>;
  amount: Generated<string>; // decimal
  is_active: Generated<number>; // tinyint
  created_by: number; // FK do users
  created_at: Generated<Date>;
  deleted_at: Date | null;
}

export interface PaymentsRegularUsersTable {
  payment_regular_user_id: Generated<number>;
  payment_regular_id: number;
  person_id: number; // FK do persons
  payer_id: number; // FK do persons
  payment_account_id: number;
  amount: Generated<string>; // decimal
  frequency: Generated<PaymentFrequency>;
  frequency_index: number;
  is_active: Generated<number>; // tinyint
  note: string | null;
  created_by: number; // FK do users
  created_at: Generated<Date>;
  deleted_at: Date | null;
}

export interface PaymentsTransfersTable {
  payment_log_id: Generated<number>;
  source_id: number;
  target_id: number;
  amount: Generated<string>; // decimal
  description: string | null;
  created_by: number; // FK do users
  created_at: Generated<Date>;
}