import { t } from 'elysia';

export const UploadFilesBodySchema = t.Object({
  files: t.Files({
    description: 'Array of files to upload',
  }),
  origin: t.Optional(t.String({
    description: 'Optional origin or domain category for the files',
  })),
});

export const DeleteFileParamSchema = t.Object({
  id: t.String({
    description: 'File UUID',
  }),
});

export const DownloadFileParamSchema = t.Object({
  id: t.String({
    description: 'File UUID',
  }),
});

export const ViewFileQuerySchema = t.Object({
  access_token: t.Optional(t.String({
    description: 'Temporary file access token',
  })),
});
