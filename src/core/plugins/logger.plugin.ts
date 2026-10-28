import { Elysia } from 'elysia';

export const loggerPlugin = new Elysia({ name: 'logger-plugin' })
  .onRequest(({ request, store }: any) => {
    store.requestStartTime = performance.now();
  })
  .onAfterResponse(({ request, set, store }: any) => {
    const duration = store.requestStartTime
      ? (performance.now() - store.requestStartTime).toFixed(1)
      : '?';
    const status = set.status || 200;
    const url = new URL(request.url);

    // Skip verbose logging for high-frequency internal heartbeat/ws ping endpoints
    if (url.pathname === '/version' || url.pathname === '/locales') {
      return;
    }

    const statusBadge =
      status >= 500 ? '🔴' : status >= 400 ? '🟡' : status >= 300 ? '🔵' : '🟢';

    console.log(
      `[HTTP] ${statusBadge} ${request.method} ${url.pathname} ${status} - ${duration}ms`
    );
  });
