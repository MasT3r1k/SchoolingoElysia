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
        .leftJoin('users', 'users.user_id', 'tokens.user_id')
        .select(['tokens.token_id', 'tokens.user_id', 'users.person_id', 'users.manager', 'users.principal', 'users.role'])
        .where('tokens.token', '=', token)
        .where('tokens.expires', '>=', new Date())
        .executeTakeFirst();

      if (!auth?.person_id) return { error: 'no_user', details: 'no_db' };

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
          const country = await db.selectFrom('countries').select('country_id').where('code2', '=', countryCode).executeTakeFirst();
          if (!country) return null;

          // 2. Find or create city
          let city = await db.selectFrom('cities')
            .select('city_id')
            .where('city_name', '=', addr.cityName)
            .where('postcode', '=', addr.postcode)
            .where('country_id', '=', country.country_id)
            .executeTakeFirst();
          
          let cityId: number;
          if (!city) {
            const newCity = await db.insertInto('cities')
              .values({
                city_name: addr.cityName,
                postcode: addr.postcode,
                country_id: country.country_id
              })
              .executeTakeFirst();
            cityId = Number(newCity.insertId);
          } else {
            cityId = city.city_id;
          }

          // 3. Find or create address
          let address = await db.selectFrom('addresses')
            .select('address_id')
            .where('city_id', '=', cityId)
            .where('street', '=', addr.street)
            .where('house_number', '=', addr.houseNumber)
            .executeTakeFirst();
          
          let addressId: number;
          if (!address) {
            const newAddress = await db.insertInto('addresses')
              .values({
                city_id: cityId,
                street: addr.street,
                house_number: addr.houseNumber
              })
              .executeTakeFirst();
            addressId = Number(newAddress.insertId);
          } else {
            addressId = address.address_id;
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
            vat_id: vatId,
            web,
            email,
            phone,
            rp_first_name: rp_firstName,
            rp_last_name: rp_lastName,
            contact,
            description,
            activity,
            equipment,
            status: finalStatus as any,
            address_office: officeAddrId,
            address_trainee: traineeAddrId || officeAddrId,
            country_code: addressOffice.countryCode || 'CZ',
            created: moment().toDate(),
            requested: finalStatus === 'request' ? moment().toDate() : null
          })
          .executeTakeFirst();

        const companyId = Number(companyResult.insertId);

        // Insert scopes if any
        if (body.scopes && body.scopes.length > 0) {
          const scopeValues = body.scopes.map((scopeId: number) => ({
            company_id: companyId,
            scope_id: scopeId,
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
