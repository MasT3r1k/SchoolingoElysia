import { Elysia } from 'elysia';
import { storageRouter } from './storage/storage.routes';
import { systemRouter } from './system/system.routes';
import { authRouter } from './auth/auth.routes';
import { usersRouter, userAliasesRouter } from './users/users.routes';
import { schoolRouter } from './school/school.routes';

/**
 * Enterprise Application Router
 * Statically composes domain modules with full OpenAPI/Swagger and Eden-RPC type inference.
 */
export const appRouter = new Elysia({ name: 'AppRouter' })
  .use(authRouter)
  .use(usersRouter)
  .use(userAliasesRouter)
  .use(schoolRouter)
  .use(storageRouter)
  .use(systemRouter);
