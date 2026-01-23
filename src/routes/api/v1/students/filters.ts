import { Elysia } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';
import { rateLimit } from 'elysia-rate-limit'
import { app } from '../../../../../index';

const filterApp = new Elysia()
    .get('/students/filters', async () => {
        const [classes, scopes] = await Promise.all([
            // Get all active classes
            db.selectFrom('classes')
                .innerJoin('school_years', 'school_years.syId', 'classes.yearId')
                .select([
                    'classes.classId as id',
                    sql<string>`concat(classes.prefix, TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, classes.suffix)`.as('name')
                ])
                .orderBy('name', 'asc')
                .execute(),

            // Get all scopes
            db.selectFrom('scopes')
                .select([
                    'scopes.scopeId as id',
                    'scopes.name'
                ])
                .orderBy('scopes.name', 'asc')
                .execute()
        ]);

        return Response.json({
            classes,
            scopes
        });
    });

export default filterApp;
