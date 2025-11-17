export interface emailsTable {
  email: string
  personId: number
  type: 'personal' | 'school' | 'work' | 'other';
  description: string | null
  is_verified: boolean;
}