import { Elysia } from 'elysia';
import { MessagesConfig } from '../../../../config/message.config';

const app = new Elysia()
  .get('/messages/config', async ({ cookie }) => {
    const token = cookie.token?.value as string;
    if (!token) {
      return Response.json({ error: 'no_user', details: 'no_cookie' });
    }

    const config = {
      supported_files: MessagesConfig.SUPPORTED_FILE_FORMAT,
      files_limit: MessagesConfig.MESSAGE_FILES_LIMIT,
      file_max_size_in_mb: MessagesConfig.FILE_MAX_SIZE_MB,
      title_max_length: MessagesConfig.MESSAGE_TITLE_MAX_LENGTH,
      title_min_length: MessagesConfig.MESSAGE_TITLE_MIN_LENGTH,
      content_max_length: MessagesConfig.MESSAGE_CONTENT_MAX_LENGTH,
      content_min_length: MessagesConfig.MESSAGE_CONTENT_MIN_LENGTH
    }

    return Response.json(config)
  });

export default app;