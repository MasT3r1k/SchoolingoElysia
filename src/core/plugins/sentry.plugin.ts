import * as Sentry from '@sentry/elysia';
import { Elysia } from 'elysia';
import { env } from '../config/env.config';

let isSentryInitialized = false;

export function initSentry() {
  if (isSentryInitialized) return;

  if (env.SENTRY_DSN) {
    Sentry.init({
      dsn: env.SENTRY_DSN,
      environment: env.NODE_ENV,
      tracesSampleRate: env.NODE_ENV === 'production' ? 0.2 : env.SENTRY_TRACES_SAMPLE_RATE,
      beforeSend(event) {
        if (event.request?.headers) {
          delete event.request.headers['cookie'];
          delete event.request.headers['authorization'];
        }
        return event;
      },
    });
    isSentryInitialized = true;
    console.log('[🛡️ Sentry]: Initialized in', env.NODE_ENV, 'mode');
  }
}

export function captureException(error: unknown, context?: Record<string, unknown>) {
  if (!isSentryInitialized) return;
  if (context) {
    Sentry.withScope((scope) => {
      scope.setExtras(context);
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}

export const sentryPlugin = new Elysia({ name: 'sentry-plugin' })
  .onRequest(({ request }) => {
    if (!isSentryInitialized) return;
    const url = new URL(request.url);
    Sentry.addBreadcrumb({
      category: 'http',
      message: `${request.method} ${url.pathname}`,
      level: 'info',
    });
  })
  .derive(() => {
    return {
      setSentryUser: (user: { user_id: number; username?: string | null; role?: string | null }) => {
        if (!isSentryInitialized) return;
        Sentry.setUser({
          id: String(user.user_id),
          username: user.username ?? undefined,
        });
        if (user.role) {
          Sentry.setTag('user.role', user.role);
        }
      },
      setSentrySchool: (schoolId: number | string) => {
        if (!isSentryInitialized) return;
        Sentry.setTag('school.id', String(schoolId));
      },
    };
  });
