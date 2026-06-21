import { renderPdf } from './renderer'
import { DocumentType } from './types'

export async function generateDocument(type: DocumentType, data: any) {
  switch (type) {
    case 'rozvrh':
    case 'student_list':
    case 'student_marks':
    case 'class_marks':
    case 'grade_overview':
    case 'potvrzeni_studia':
    case 'vysvedceni':
    case 'vysvedceni_zs':
    case 'vysvedceni_ss':
    case 'vypis_vysvedceni_zs':
    case 'vypis_vysvedceni_ss':
      return renderPdf(type, data)

    default:
      throw new Error('Unknown document type')
  }
}