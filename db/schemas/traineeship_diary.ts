export interface Traineeship_diaryTable {
  diaryId: number
  trWeekId: number
  studentId: number
  status: 'unlisted' | 'filed'
  date: string // date
  title: string
  hours: number
  gained: string
  description: string
  mark: string
}
