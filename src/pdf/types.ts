export type DocumentType =
  | 'rozvrh'
  | 'student_list'
  | 'student_marks'
  | 'class_marks'
  | 'grade_overview'
  | 'potvrzeni_studia'
  | 'vysvedceni'
  | 'vysvedceni_zs'
  | 'vysvedceni_ss'
  | 'vypis_vysvedceni_zs'
  | 'vypis_vysvedceni_ss'
export interface BaseDocumentData {
  id: string
  studentName: string
  className: string
  issuedAt: string
}