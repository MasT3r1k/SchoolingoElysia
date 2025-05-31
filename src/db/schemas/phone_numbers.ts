export interface phone_numbersTable {
  code: number;
  number: string;
  personId: number;
  type: 'mobile' | 'home' | 'work' | 'fax';
  verified: boolean;
  description: string | null;
}
