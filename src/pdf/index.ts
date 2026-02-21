import { renderPdf } from './renderer'
import { DocumentType } from './types'

export async function generateDocument(type: DocumentType, data: any) {
    console.log(type)
  switch (type) {
    case 'rozvrh':
    console.log('ROZVRH FOUND')

      return renderPdf('rozvrh', data)

    default:
      throw new Error('Unknown document type')
  }
}