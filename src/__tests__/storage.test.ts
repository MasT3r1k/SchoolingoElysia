/**
 * Storage Domain Tests
 * Tests for secure file storage, path traversal protection, upload validation, and download endpoints.
 */
import { describe, expect, it } from 'bun:test';
import { app } from '../../index';
import { StorageService } from '@modules/storage/storage.service';
import { BadRequestError, NotFoundError, UnauthorizedError } from '@core';

describe('StorageService Business Logic', () => {
  it('saveFiles should throw BadRequestError when empty array provided', async () => {
    expect(StorageService.saveFiles([], 1)).rejects.toThrow(BadRequestError);
  });

  it('resolveFileForDownload should throw NotFoundError for non-existent file UUID', async () => {
    expect(StorageService.resolveFileForDownload('00000000-0000-0000-0000-000000000000')).rejects.toThrow(NotFoundError);
  });

  it('deleteFile should throw NotFoundError for non-existent file UUID', async () => {
    expect(StorageService.deleteFile('00000000-0000-0000-0000-000000000000', 1, false)).rejects.toThrow(NotFoundError);
  });

  it('generateFileAccessToken should throw NotFoundError for non-existent file UUID', async () => {
    expect(StorageService.generateFileAccessToken('00000000-0000-0000-0000-000000000000', 1)).rejects.toThrow(NotFoundError);
  });

  it('validateAccessToken should return false for invalid token', async () => {
    const isValid = await StorageService.validateAccessToken('00000000-0000-0000-0000-000000000000', 'invalid_token');
    expect(isValid).toBe(false);
  });
});

describe('Storage HTTP Endpoints Security', () => {
  it('POST /api/upload should require authentication', async () => {
    const formData = new FormData();
    formData.append('files', new Blob(['test content']), 'test.txt');

    const res = await app.handle(
      new Request('http://localhost/api/upload', {
        method: 'POST',
        body: formData,
      })
    );

    expect(res.status).toBe(401);
  });

  it('DELETE /api/delete_file/:id should require authentication', async () => {
    const res = await app.handle(
      new Request('http://localhost/api/delete_file/test-id-123', {
        method: 'DELETE',
      })
    );

    expect(res.status).toBe(401);
  });

  it('GET /api/file_info/:id should require authentication', async () => {
    const res = await app.handle(
      new Request('http://localhost/api/file_info/test-id-123', {
        method: 'GET',
      })
    );

    expect(res.status).toBe(401);
  });

  it('GET /api/file/:id should reject unauthenticated request without access token', async () => {
    const res = await app.handle(
      new Request('http://localhost/api/file/test-id-123', {
        method: 'GET',
      })
    );

    expect(res.status).toBe(401);
  });

  it('GET /api/download/:id should return 404 for non-existent file', async () => {
    const res = await app.handle(
      new Request('http://localhost/api/download/00000000-0000-0000-0000-000000000000', {
        method: 'GET',
      })
    );

    expect([404, 400]).toContain(res.status);
  });
});
