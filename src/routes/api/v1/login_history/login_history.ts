import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import { sql } from 'kysely';
import { rateLimit } from 'elysia-rate-limit'
import { app } from '../../../../../index';
import moment from 'moment';

const elysiaApp = new Elysia()
  .use(rateLimit({
    scoping: "scoped",
    max: 10,
    duration: 1000,
    injectServer: () => app.server
  }))
  .get('/login_history', async ({ cookie, query }) => {
    const token = cookie.token.value;
    if (!token) {
        return Response.json({ error: 'no_user', details: 'no_cookie' });
    }

    const user = await db.selectFrom("tokens")
        .innerJoin('users', 'users.userId', 'tokens.userId')
        .innerJoin("passwords", "passwords.passwordId", "users.password")
        .select([
            'users.userId',
            'users.username',
            'users.2fa',
            'users.2fa_secret',
            'passwords.password'
        ])
        .where('tokens.token', '=', token)
        .where('tokens.expires', '>=', moment().toDate())
        .limit(1)
        .executeTakeFirst()

    if (!user) {
        return Response.json({ error: 'no_user', details: 'no_db' });
    }

    try {
        const count = await db.selectFrom("login_history")
            .select([
                sql`COUNT(*)`.as('count')
            ])
            .where('login_history.userId', '=', user.userId)
            .executeTakeFirst();

        const login_history = await db.selectFrom("login_history")
            .select([
                'login_history.type',
                'login_history.success',
                'login_history.ip',
                'login_history.userAgent',
                'login_history.error',
                'login_history.created'
            ])
            .limit(query.limit)
            .offset(query.offset)
            .orderBy('login_history.created', 'desc')
            .where('login_history.userId', '=', user.userId)
            .execute();

        return Response.json({ count: count?.count, data: login_history });
    } catch (e) {
      return new Response(JSON.stringify({ error: "Student not found", e }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  }, {
    query: t.Object({
        limit: t.Number({ default: 10, maximum: 100, minimum: 1 }),
        offset: t.Number({ default: 0, minimum: 0 })
    }),
    detail: {
      description: "This endpoint is rate-limited: max 1 request per 1 second",
      responses: {
        200: {
          description: "Successful response",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  fullName: { type: "string", example: "Ing. Bc. Josef Kosík" },
                  status: { type: "string", enum: ["active", "archive"] },
                  startStudy: { type: "string", example: "06. 09. 2021" },
                  className: { type: "string", example: "B3.I" },
                  groups: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        groupId: { type: "number", example: 42 },
                        name: { type: "string", example: "Laboratorní skupina A" },
                        num: { type: "string", example: "01" },
                        class: { type: "string", example: "B3.I" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        404: {
          description: "Invalid student",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  error: { type: "string", example: "Student not found" }
                }
              }
            }
          }
        },
        429: {
          description: "Rate limit exceeded",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "rate-limited"
                  }
                }
              }
            }
          }
        }
      }
    }
  });

export default elysiaApp;
