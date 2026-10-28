import { Elysia } from 'elysia';
import { createReadStream } from 'node:fs';
import { StorageService } from './storage.service';
import {
  UploadFilesBodySchema,
  DeleteFileParamSchema,
  DownloadFileParamSchema,
  ViewFileQuerySchema,
} from './storage.dto';
import { authContext, requireAuth } from '../../core/middleware/auth.guard';
import { UnauthorizedError, ForbiddenError } from '../../core/errors/http-errors';

export const storageRouter = new Elysia({ prefix: '/api' })
  .use(authContext)

  // 1. Upload files
  .post(
    '/upload',
    async ({ body, user }) => {
      if (!user) {
        throw new UnauthorizedError('Authentication required to upload files');
      }

      const files = Array.isArray(body.files) ? body.files : [body.files];
      const storedFiles = await StorageService.saveFiles(files, user.user_id, body.origin);

      return {
        success: true,
        files: storedFiles,
      };
    },
    {
      body: UploadFilesBodySchema,
      detail: {
        tags: ['Storage'],
        summary: 'Upload one or multiple files',
      },
    }
  )

  // 2. Delete file
  .delete(
    '/delete_file/:id',
    async ({ params, user }) => {
      if (!user) {
        throw new UnauthorizedError('Authentication required to delete file');
      }

      const isManager = user.manager === -1;
      await StorageService.deleteFile(params.id, user.user_id, isManager);

      return {
        success: true,
        id: params.id,
      };
    },
    {
      params: DeleteFileParamSchema,
      detail: {
        tags: ['Storage'],
        summary: 'Delete a file by UUID',
      },
    }
  )

  // 3. Download file
  .get(
    '/download/:id',
    async ({ params, set }) => {
      const { filepath, fileName, mimeType } = await StorageService.resolveFileForDownload(params.id);

      set.headers['Content-Type'] = mimeType;
      set.headers['Content-Disposition'] = `attachment; filename="${encodeURIComponent(fileName)}"`;

      return createReadStream(filepath);
    },
    {
      params: DownloadFileParamSchema,
      detail: {
        tags: ['Storage'],
        summary: 'Download a file attachment by UUID',
      },
    }
  )

  // 4. File Info & Access Token Preview
  .get(
    '/file_info/:id',
    async ({ params, user }) => {
      if (!user) {
        throw new UnauthorizedError('Authentication required to access file info');
      }

      const info = await StorageService.generateFileAccessToken(params.id, user.user_id);

      return {
        file_name: info.fileName,
        size: info.size,
        lines: info.lines,
        content: info.content,
        access_token: info.accessToken,
      };
    },
    {
      params: DownloadFileParamSchema,
      detail: {
        tags: ['Storage'],
        summary: 'Inspect text file metadata and generate an access token',
      },
    }
  )

  // 5. Stream file inline
  .get(
    '/file/:id',
    async ({ params, query, user, set }) => {
      const hasAccessToken = query.access_token
        ? await StorageService.validateAccessToken(params.id, query.access_token)
        : false;

      if (!user && !hasAccessToken) {
        throw new UnauthorizedError('Access token or session required to view file');
      }

      const { filepath, fileName, mimeType } = await StorageService.resolveFileForDownload(params.id);

      set.headers['Content-Type'] = mimeType;
      set.headers['Content-Disposition'] = `inline; filename="${encodeURIComponent(fileName)}"`;

      return createReadStream(filepath);
    },
    {
      params: DownloadFileParamSchema,
      query: ViewFileQuerySchema,
      detail: {
        tags: ['Storage'],
        summary: 'View or stream a file inline by UUID',
      },
    }
  );
