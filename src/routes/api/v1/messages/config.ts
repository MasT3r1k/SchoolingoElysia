import { Elysia } from 'elysia';
import { MessagesConfig } from '../../../../config/message.config';
import { db } from '../../../../../database';

const app = new Elysia()
  .get('/messages/config', async ({ cookie, school }: any) => {
    const token = cookie.token?.value as string;
    if (!token) {
      return Response.json({ error: 'no_user', details: 'no_cookie' });
    }

    const [schoolData, breaks] = await Promise.all([
      db.selectFrom('schools')
        .select(['start_hour', 'start_minute', 'lesson_hour', 'break_time'])
        .where('school_id', '=', school.school_id)
        .executeTakeFirst(),
      db.selectFrom('school_breaks')
        .select(['hour', 'minutes'])
        .where('school_id', '=', school.school_id)
        .execute()
    ]);

    const config = {
      supported_files: MessagesConfig.SUPPORTED_FILE_FORMAT,
      files_limit: MessagesConfig.MESSAGE_FILES_LIMIT,
      file_max_size_in_mb: MessagesConfig.FILE_MAX_SIZE_MB,
      title_max_length: MessagesConfig.MESSAGE_TITLE_MAX_LENGTH,
      title_min_length: MessagesConfig.MESSAGE_TITLE_MIN_LENGTH,
      content_max_length: MessagesConfig.MESSAGE_CONTENT_MAX_LENGTH,
      content_min_length: MessagesConfig.MESSAGE_CONTENT_MIN_LENGTH,
      school_hours: schoolData,
      school_breaks: breaks
    }

    return Response.json(config)
  });

export default app;