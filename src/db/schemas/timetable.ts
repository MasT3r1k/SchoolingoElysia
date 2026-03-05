export interface TimetableTable {
  lesson_id: number
  day: number
  hour: number
  type: number
  subject_id: number
  teacher_id: number
  teacher2_id: number | null
  room_id: number
  group_id: number
}