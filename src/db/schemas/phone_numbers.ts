export interface phone_numbersTable {
  code: number;
  number: string;
  person_id: number;
  description: string | null;
  is_verified: boolean;
  phone_code: string | null;
  code_until: Date | null;
}
