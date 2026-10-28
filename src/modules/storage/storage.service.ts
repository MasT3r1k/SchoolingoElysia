import { mkdir, writeFile, unlink, stat, readFile } from 'node:fs/promises';
import { existsSync, createReadStream } from 'node:fs';
import { randomUUID, createHash } from 'node:crypto';
import path, { join } from 'node:path';
import mime from 'mime-types';
import { db } from '../../core/database/connection';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../core/errors/http-errors';

const UPLOAD_DIR = path.resolve('./uploads');

if (!existsSync(UPLOAD_DIR)) {
  await mkdir(UPLOAD_DIR, { recursive: true });
}

export interface StoredFileRecord {
  id: number;
  uuid: string;
  filename: string;
  originalName: string;
  size: number;
  type: string;
  url: string;
}

export class StorageService {
  /**
   * Save uploaded files to disk and DB
   */
  static async saveFiles(
    files: File[],
    userId: number,
    origin?: string
  ): Promise<StoredFileRecord[]> {
    if (!files || files.length === 0) {
      throw new BadRequestError('No files were uploaded');
    }

    const storedFiles: StoredFileRecord[] = [];

    for (const entry of files) {
      if (!(entry instanceof File)) continue;

      const originalName = entry.name || `file_${randomUUID()}.bin`;
      const ext = originalName.includes('.') ? '.' + originalName.split('.').pop() : '.bin';
      const fileUuid = randomUUID();
      const filename = `${fileUuid}${ext}`;
      const filepath = join(UPLOAD_DIR, filename);

      const arrayBuffer = await entry.arrayBuffer();
      const nodeBuffer = Buffer.from(arrayBuffer);

      await writeFile(filepath, nodeBuffer);

      const checksum = createHash('sha256').update(nodeBuffer).digest('hex');
      const mimeType = entry.type || (mime.lookup(filepath) as string) || 'application/octet-stream';

      const dbFile = await db
        .insertInto('files')
        .values({
          file_uuid: fileUuid,
          name: filename,
          real_file_name: originalName,
          origin: origin ?? null,
          file_format: ext,
          mime_type: mimeType,
          file_size: entry.size,
          storage_path: filename,
          thumbnail_path: null,
          permissions: JSON.stringify({}),
          owner_id: userId,
          checksum,
        })
        .executeTakeFirst();

      storedFiles.push({
        id: Number(dbFile.insertId),
        uuid: fileUuid,
        filename,
        originalName,
        size: entry.size,
        type: mimeType,
        url: filename,
      });
    }

    return storedFiles;
  }

  /**
   * Delete file by UUID
   */
  static async deleteFile(fileUuid: string, userId: number, isManager: boolean): Promise<void> {
    const file = await db
      .selectFrom('files')
      .select(['file_uuid', 'owner_id', 'storage_path', 'name'])
      .where('file_uuid', '=', fileUuid)
      .limit(1)
      .executeTakeFirst();

    if (!file) {
      throw new NotFoundError('File not found');
    }

    const isOwner = file.owner_id === userId;
    if (!isOwner && !isManager) {
      throw new ForbiddenError('You do not have permission to delete this file');
    }

    if (file.storage_path) {
      const filepath = path.resolve(UPLOAD_DIR, file.storage_path);
      if (existsSync(filepath)) {
        await unlink(filepath).catch((err) => console.warn('[Storage]: File unlink error:', err));
      }
    }

    await db.deleteFrom('files').where('file_uuid', '=', fileUuid).execute();
  }

  /**
   * Resolve secure file path for download/streaming
   */
  static async resolveFileForDownload(fileUuid: string): Promise<{ filepath: string; fileName: string; mimeType: string }> {
    const file = await db
      .selectFrom('files')
      .select(['storage_path', 'real_file_name', 'mime_type'])
      .where('file_uuid', '=', fileUuid)
      .executeTakeFirst();

    if (!file || !file.storage_path) {
      throw new NotFoundError('File not found');
    }

    const filepath = path.resolve(UPLOAD_DIR, file.storage_path);

    if (!filepath.startsWith(UPLOAD_DIR)) {
      throw new ForbiddenError('Invalid file path');
    }

    if (!existsSync(filepath)) {
      throw new NotFoundError('File does not exist on disk');
    }

    const mimeType = file.mime_type || (mime.lookup(filepath) as string) || 'application/octet-stream';
    const fileName = file.real_file_name ?? path.basename(file.storage_path);

    return { filepath, fileName, mimeType };
  }

  /**
   * Generate temporary access token for file viewing
   */
  static async generateFileAccessToken(fileUuid: string, userId: number): Promise<{
    fileName: string;
    size: number;
    lines: number;
    content: string;
    accessToken: string;
  }> {
    const file = await db
      .selectFrom('files')
      .select(['file_id', 'storage_path', 'real_file_name'])
      .where('file_uuid', '=', fileUuid)
      .executeTakeFirst();

    if (!file || !file.storage_path) {
      throw new NotFoundError('File not found');
    }

    const filepath = path.resolve(UPLOAD_DIR, file.storage_path);
    if (!filepath.startsWith(UPLOAD_DIR)) {
      throw new ForbiddenError('Invalid file path');
    }

    if (!existsSync(filepath)) {
      throw new NotFoundError('File does not exist on disk');
    }

    const fileStat = await stat(filepath);
    const MAX_SIZE = 2 * 1024 * 1024;

    if (fileStat.size > MAX_SIZE) {
      throw new BadRequestError('File is too large for inline content preview');
    }

    const content = await readFile(filepath, 'utf-8');
    const lines = content === '' ? 0 : content.split(/\r?\n/).length;

    const accessToken = randomUUID();
    const expireAt = new Date(Date.now() + 15 * 60 * 1000);

    await db
      .insertInto('files_tokens')
      .values({
        file_id: file.file_id,
        access_token: accessToken,
        expire_at: expireAt,
        token_owner: userId,
      })
      .execute();

    return {
      fileName: file.real_file_name ?? 'unknown',
      size: fileStat.size,
      lines,
      content,
      accessToken,
    };
  }

  /**
   * Validate access token for viewing file
   */
  static async validateAccessToken(fileUuid: string, accessToken: string): Promise<boolean> {
    const record = await db
      .selectFrom('files_tokens')
      .leftJoin('files', 'files.file_id', 'files_tokens.file_id')
      .select(['files_tokens.used_count', 'files_tokens.file_id', 'files_tokens.access_token'])
      .where('files.file_uuid', '=', fileUuid)
      .where('files_tokens.access_token', '=', accessToken)
      .where('files_tokens.expire_at', '>=', new Date())
      .executeTakeFirst();

    if (!record) return false;

    await db
      .updateTable('files_tokens')
      .set({ used_count: record.used_count + 1 })
      .where('file_id', '=', record.file_id)
      .where('access_token', '=', accessToken)
      .execute();

    return true;
  }
}
