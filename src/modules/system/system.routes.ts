import { Elysia } from 'elysia';
import { gitService } from './system.service';
import { changelog } from '../../data/changelog.data';

const getVersionHandler = async () => {
  const counts = await gitService.getAheadBehindCount();
  return {
    version: changelog[0]?.version ?? '1.0.0',
    current: gitService.localCommit,
    latest: gitService.remoteCommit,
    isUpToDate: gitService.localCommit === gitService.remoteCommit,
    isAhead: counts.ahead > 0,
    isBehind: counts.behind > 0,
    aheadCount: counts.ahead,
    behindCount: counts.behind,
  };
};

export const systemRouter = new Elysia()
  // Root /version alias for health checks & tests
  .get('/version', getVersionHandler, {
    detail: {
      tags: ['System'],
      summary: 'Get system and Git version status (root alias)',
    },
  })
  .group('/api/v1', (group) =>
    group
      .get('/version', getVersionHandler, {
        detail: {
          tags: ['System'],
          summary: 'Get system and Git version status',
        },
      })
      .post(
        '/refresh',
        async () => {
          await gitService.refreshRemote();
          const remoteVersion = await gitService.loadRemoteVersion();
          const counts = await gitService.getAheadBehindCount();

          return {
            ok: true,
            version: changelog[0]?.version ?? '1.0.0',
            remoteVersion,
            current: gitService.localCommit,
            latest: gitService.remoteCommit,
            isUpToDate: gitService.localCommit === gitService.remoteCommit,
            isAhead: counts.ahead > 0,
            isBehind: counts.behind > 0,
            aheadCount: counts.ahead,
            behindCount: counts.behind,
          };
        },
        {
          detail: {
            tags: ['System'],
            summary: 'Refresh remote Git commit status',
          },
        }
      )
      .get(
        '/changelog',
        () => {
          return changelog;
        },
        {
          detail: {
            tags: ['System'],
            summary: 'Get application changelog entries',
          },
        }
      )
  );
