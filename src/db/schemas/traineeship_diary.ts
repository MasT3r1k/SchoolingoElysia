import { Generated } from "kysely"

export interface Traineeship_diaryTable {
  diary_id: Generated<number>
  tr_week_id: number
  student_id: number
  status: Generated<'unlisted' | 'filed'>
  date: Date
  title: string
  hours: number
  gained: string
  description: string
  mark: string
}
