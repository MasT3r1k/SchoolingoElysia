import { renderPdf } from './renderer'
import { DocumentType } from './types'

export async function generateDocument(type: DocumentType, data: any) {
    console.log(type)
  switch (type) {
    case 'rozvrh':
      return renderPdf('rozvrh', data)
    case 'student_list':
    case 'student_marks':
    case 'class_marks':
    case 'grade_overview':
      return renderPdf(type, data)

    default:
      throw new Error('Unknown document type')
  }
}