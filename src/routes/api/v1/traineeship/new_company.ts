import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import moment from 'moment';

const app = new Elysia()
  .post(
    '/traineeship/new_company',
    async ({ body, cookie }) => {
      const token = cookie.token?.value as string;
      if (!token) return { error: 'no_user', details: 'no_cookie' };

      const auth = await db
        .selectFrom('tokens')
        .leftJoin('users', 'users.userId', 'tokens.userId')
        .select(['tokens.tokenId', 'tokens.userId', 'users.person', 'users.manager', 'users.principal', 'users.role'])
        .where('tokens.token', '=', token)
        .where('tokens.expires', '>=', new Date())
        .executeTakeFirst();

      if (!auth?.person) return { error: 'no_user', details: 'no_db' };

      const isAdmin = auth.role === 'admin_staff' || auth.role === 'management' || auth.principal === true;
      
      const { 
        name, ico, dic, vatId, web, email, phone, 
        rp_firstName, rp_lastName, contact, description, 
        activity, equipment, status,
        addressOffice, addressTrainee
      } = body;

      // Force status to 'request' if not admin
      let finalStatus = isAdmin ? (status || 'approved') : 'request';

      try {
        // Function to ensure city and address exist
        const ensureAddress = async (addr: any) => {
          if (!addr) return null;

          // 1. Find or create country? Assuming we have countries. Let's use countryCode from body or default.
          const countryCode = addr.countryCode || 'CZ';
          const country = await db.selectFrom('countries').select('countryId').where('code2', '=', countryCode).executeTakeFirst();
          if (!country) return null;

          // 2. Find or create city
          let city = await db.selectFrom('cities')
            .select('cityId')
            .where('cityName', '=', addr.cityName)
            .where('postcode', '=', addr.postcode)
            .where('countryId', '=', country.countryId)
            .executeTakeFirst();
          
          let cityId: number;
          if (!city) {
            const newCity = await db.insertInto('cities')
              .values({
                cityName: addr.cityName,
                postcode: addr.postcode,
                countryId: country.countryId
              })
              .executeTakeFirst();
            cityId = Number(newCity.insertId);
          } else {
            cityId = city.cityId;
          }

          // 3. Find or create address
          let address = await db.selectFrom('addresses')
            .select('addressId')
            .where('cityId', '=', cityId)
            .where('street', '=', addr.street)
            .where('houseNumber', '=', addr.houseNumber)
            .executeTakeFirst();
          
          let addressId: number;
          if (!address) {
            const newAddress = await db.insertInto('addresses')
              .values({
                cityId,
                street: addr.street,
                houseNumber: addr.houseNumber
              })
              .executeTakeFirst();
            addressId = Number(newAddress.insertId);
          } else {
            addressId = address.addressId;
          }

          return addressId;
        };

        const officeAddrId = await ensureAddress(addressOffice);
        const traineeAddrId = addressTrainee ? await ensureAddress(addressTrainee) : officeAddrId;

        if (!officeAddrId) {
          return Response.json({ error: 'invalid_address' });
        }

        const companyResult = await db.insertInto('traineeship_companies')
          .values({
            name,
            ico,
            dic,
            vatId,
            web,
            email,
            phone,
            rp_firstName,
            rp_lastName,
            contact,
            description,
            activity,
            equipment,
            status: finalStatus as any,
            addressOffice: officeAddrId,
            addressTrainee: traineeAddrId || officeAddrId,
            countryCode: addressOffice.countryCode || 'CZ',
            created: moment().format('YYYY-MM-DD HH:mm:ss'),
            requested: finalStatus === 'request' ? moment().format('YYYY-MM-DD HH:mm:ss') : null
          })
          .executeTakeFirst();

        const companyId = Number(companyResult.insertId);

        // Insert scopes if any
        if (body.scopes && body.scopes.length > 0) {
          const scopeValues = body.scopes.map((scopeId: number) => ({
            companyId,
            scopeId,
            status: true
          }));
          await db.insertInto('traineeship_company_scopes').values(scopeValues).execute();
        }

        return Response.json({
          status: 'success',
          companyId
        });

      } catch (e: any) {
        console.error(e);
        return Response.json({
          status: 'error',
          error: 'failed_to_save',
          details: e.message
        });
      }
    },
    {
      body: t.Object({
        name: t.String(),
        ico: t.String(),
        dic: t.String(),
        vatId: t.String(),
        web: t.Optional(t.Nullable(t.String())),
        email: t.Optional(t.Nullable(t.String())),
        phone: t.Optional(t.Nullable(t.String())),
        rp_firstName: t.Optional(t.Nullable(t.String())),
        rp_lastName: t.Optional(t.Nullable(t.String())),
        contact: t.Optional(t.Nullable(t.String())),
        description: t.Optional(t.Nullable(t.String())),
        activity: t.Optional(t.Nullable(t.String())),
        equipment: t.Optional(t.Nullable(t.String())),
        status: t.Optional(t.Union([
          t.Literal('approved'),
          t.Literal('acceptable'),
          t.Literal('request')
        ])),
        scopes: t.Optional(t.Array(t.Number())),
        addressOffice: t.Object({
          street: t.String(),
          houseNumber: t.String(),
          cityName: t.String(),
          postcode: t.String(),
          countryCode: t.Optional(t.String())
        }),
        addressTrainee: t.Optional(t.Nullable(t.Object({
          street: t.String(),
          houseNumber: t.String(),
          cityName: t.String(),
          postcode: t.String(),
          countryCode: t.Optional(t.String())
        })))
      })
    }
  );

export default app;
