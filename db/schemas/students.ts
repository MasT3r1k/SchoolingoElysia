export interface StudentsTable {
  personId: number
  class: number
  status: 'active' | 'archive',
  startStudy: Date
}