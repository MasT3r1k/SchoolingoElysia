export type DocumentType =
  | 'rozvrh'
  | 'student_list'
  | 'student_marks'
  | 'class_marks'
  | 'grade_overview'
export interface BaseDocumentData {
  id: string
  studentName: string
  className: string
  issuedAt: string
}