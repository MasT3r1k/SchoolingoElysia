
import { Elysia, t } from 'elysia';
import { domainService, InstallationData } from '../../../../functions/domain.service';
import { db } from '../../../../../database';

const setupRoutes = new Elysia({ prefix: '/setup' })
    .get('/ares/:ico', async ({ params: { ico } }) => {
        return await domainService.getFromAres(ico);
    })
    .post('/search', async ({ body }) => {
        const { query, start, count } = body as any;
        return await domainService.searchFromAres(query, start, count);
    }, {
        body: t.Object({
            query: t.String(),
            start: t.Optional(t.Number()),
            count: t.Optional(t.Number())
        })
    })
    .post('/isv/search', async ({ body }) => {
        const { query } = body as any;
        return await domainService.searchFromIsv(query);
    }, {
        body: t.Object({
            query: t.String()
        })
    })
    .get('/data', async () => {
        const [countries, districts] = await Promise.all([
            db.selectFrom('countries')
                .select(['countryId', 'nationality', 'code2'])
                .orderBy('nationality', 'asc')
                .execute(),
            db.selectFrom('districts')
                .select(['districtId', 'district'])
                .orderBy('district', 'asc')
                .execute()
        ]);
        return { countries, districts };
    })
    .get('/check', async ({ request }) => {
        const origin = request.headers.get('origin') || request.headers.get('host') || '';
        
        let domain = origin.replace(/^https?:\/\//, '');
        
        const school = await domainService.getSchoolByDomain(domain);
        
        return {
            installed: !!school,
            schoolName: school?.name,
            schoolId: school?.schoolId
        };
    })
    .post('/install', async ({ body, set }) => {
        try {
           const result = await domainService.installSchool(body as InstallationData);
           return { success: true, ...result };
        } catch (e: any) {
            set.status = 409;
            return { error: e.message };
        }
    }, {
        body: t.Object({
            schoolName: t.String(),
            domain: t.String(),
            adminUsername: t.String(),
            adminPassword: t.String(),
            adminFirstName: t.String(),
            adminLastName: t.String(),
            adminEmail: t.Optional(t.String()),
            ico: t.Optional(t.String()),
            schoolShortName: t.Optional(t.String()),
            schoolType: t.Optional(t.String()),
            street: t.Optional(t.String()),
            city: t.Optional(t.String()),
            zip: t.Optional(t.String()),
            houseNumber: t.Optional(t.String()),
            orientationNumber: t.Optional(t.String()),
            districtId: t.Optional(t.Number()),
            country: t.Optional(t.Number()),
            redIzo: t.Optional(t.String()),
            izo: t.Optional(t.String()),
            schoolEmail: t.Optional(t.String()),
            schoolPhone: t.Optional(t.String()),
            schoolWeb: t.Optional(t.String()),
            databox: t.Optional(t.String()),
            director: t.Optional(t.String()),
            auth_classic: t.Optional(t.Boolean()),
            auth_ldap: t.Optional(t.Boolean()),
            auth_qr: t.Optional(t.Boolean()),
            auth_passkeys: t.Optional(t.Boolean())
        })
    });

export default setupRoutes;
