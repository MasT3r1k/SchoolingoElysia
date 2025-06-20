import { Elysia, t } from 'elysia';
import { db } from '../../../../../database'
import { rateLimit } from 'elysia-rate-limit'
import { app } from '../../../../../index';
import { ip } from 'elysia-ip';
import moment from 'moment';

const elysiaApp = new Elysia()
  .use(ip())
  .use(rateLimit({
    scoping: "scoped",
    max: 5,
    duration: 5 * 1000,
    injectServer: () => app.server
  }))
  .get('/school/', async () => {
    const now = moment().format("YYYY-MM-DD");

    const [school, breaks, year] = await Promise.all([
        db.selectFrom("schools")
        .innerJoin('districts', 'districts.districtId', 'schools.district')
        .select([
            'schools.name',
            'schools.shortName',
            'schools.code',
            'schools.startHour',
            'schools.startMinute',
            'schools.lessonHour',
            'schools.breakTime',
            'schools.resetPasswordWithEmail',
            'schools.fastlogin',
            'schools.warningAbsencePercent',
            'schools.modules',
            'schools.studentsLimit',
            'districts.district'
        ])
        .executeTakeFirst(),
        db.selectFrom("school_breaks")
        .select([
            "school_breaks.hour",
            "school_breaks.minutes"
        ])
        .execute(),
        db.selectFrom("school_years")
        .select([
          'school_years.start',
          'school_years.midterm',
          'school_years.end'
        ])
        .where('school_years.start', '<=', now)
        .where('school_years.end', '>=', now)
        .executeTakeFirst()
    ])

    return Response.json({...school, year, breaks, loginExpires: 15000});
  }, {
    detail: {
      description: "This endpoint is rate-limited: max 5 requests per 5 minutes",
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
