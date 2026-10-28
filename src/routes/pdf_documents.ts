import { Elysia, t } from 'elysia';
import { generateDocument } from '../pdf';
import type { DocumentType } from '../pdf/types';

export default new Elysia({ prefix: '/api/documents' })
  .post(
    '/generate',
    async ({ body, set }: { body: any; set: any }) => {
      const pdf = await generateDocument(body.type as DocumentType, body);

      set.headers['content-type'] = 'application/pdf';
      set.headers['content-disposition'] = 'inline; filename="document.pdf"';

      return pdf;
    },
    {
      body: t.Object(
        {
          type: t.String(),
        },
        { additionalProperties: true }
      ),
    }
  );
