import { Generated } from "kysely"

export interface Student_rewardsTable {
  reward_id: Generated<number>
  student_id: number
  title: string
  description: string;
  amount: number | null
  type: 'financial' | 'certificate' | 'prize' | 'other'
  status: 'pending' | 'received';
  created_by: number
  created_at: Generated<Date>
  collected_at: Date | null

}