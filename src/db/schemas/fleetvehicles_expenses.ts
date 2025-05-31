import { Generated } from "kysely";

export interface fleetvehicles_expensesTable {
  fvexId: Generated<number>;
  vehicleId: number;
  expense_date: Generated<Date>;
  amount: string; // decimal(10,2) jako string
  description: string;
  category: 'Service' | 'Fuel' | 'Insurance' | 'Maintenance' | 'Repairs' | 'Tires' | 'Tolls' | 'Parking Fees' | 'Cleaning' | 'Licenses and Permits' | 'Fines and Penalties' | 'Depreciation' | 'Leasing' | 'Roadside Assistance' | 'Accessories' | 'Administration Fees' | 'Registration Fees' | 'Inspection' | 'Battery Replacement' | 'Other';
  createdBy: number;
}
