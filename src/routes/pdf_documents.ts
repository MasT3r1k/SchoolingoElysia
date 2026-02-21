import { Elysia, t } from 'elysia'
import { generateDocument } from '../pdf'
import { DocumentType } from '../pdf/types'

export default new Elysia({ prefix: '/api/documents' })

  .post(
    '/generate',
    async ({ body, set }) => {
      const pdf = await generateDocument(body.type, body)

      set.headers['content-type'] = 'application/pdf'
      set.headers['content-disposition'] =
        'inline; filename="document.pdf"'

      return pdf
    },
    {
      body: t.Object({
        type: t.Any(),
        timetableData: t.Optional(t.Any())
      })
    }
  )