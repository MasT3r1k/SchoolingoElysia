import { renderPdf } from './renderer'
import { DocumentType } from './types'

export async function generateDocument(type: DocumentType) {
    console.log(type)
  switch (type) {
    case 'rozvrh':
    console.log('ROZVRH FOUND')

      return renderPdf('rozvrh')

    default:
      throw new Error('Unknown document type')
  }
}