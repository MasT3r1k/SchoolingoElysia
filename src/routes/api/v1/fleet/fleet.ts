/**
 * Fleet Vehicles API Endpoints
 * CRUD for vehicles, trips, expenses
 */
import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { Database } from '../../../../db/schemas';
import { ValueExpression } from 'kysely';

const app = new Elysia()
    // ==================== VEHICLES ====================
    
    // List all vehicles
    .get('/vehicles', async ({ cookie: { token } }) => {
        if (!token?.value) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const auth = await db
            .selectFrom('tokens')
            .select(['tokens.user_id'])
            .where('tokens.token', '=', token.value as string)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const vehicles = await db
            .selectFrom('fleetvehicles_vehicles')
            .selectAll()
            .orderBy('plate', 'asc')
            .execute();

        return Response.json({ vehicles });
    })

    // Get single vehicle with related data
    .get('/vehicles/:id', async ({ params, cookie: { token } }) => {
        if (!token?.value) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const auth = await db
            .selectFrom('tokens')
            .select(['tokens.user_id'])
            .where('tokens.token', '=', token.value as string)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const vehicleId = parseInt(params.id);
        if (isNaN(vehicleId)) {
            return Response.json({ error: 'invalid_vehicle' }, { status: 400 });
        }

        const vehicle = await db
            .selectFrom('fleetvehicles_vehicles')
            .selectAll()
            .where('vehicle_id', '=', vehicleId)
            .executeTakeFirst();

        if (!vehicle) {
            return Response.json({ error: 'not_found' }, { status: 404 });
        }

        // Get related trips
        const trips = await db
            .selectFrom('fleetvehicles_trips')
            .selectAll()
            .where('vehicle_id', '=', vehicleId)
            .orderBy('start_date', 'desc')
            .limit(10)
            .execute();

        // Get related expenses
        const expenses = await db
            .selectFrom('fleetvehicles_expenses')
            .selectAll()
            .where('vehicle_id', '=', vehicleId)
            .orderBy('expense_date', 'desc')
            .limit(10)
            .execute();

        // Get maintenance records
        const maintenance = await db
            .selectFrom('fleetvehicles_maintenance')
            .selectAll()
            .where('vehicle_id', '=', vehicleId)
            .orderBy('maintenance_date', 'desc')
            .limit(5)
            .execute();

        return Response.json({ vehicle, trips, expenses, maintenance });
    }, {
        params: t.Object({ id: t.String() })
    })

    // Create vehicle
    .post('/vehicles', async ({ body, cookie: { token } }) => {
        if (!token?.value) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const auth = await db
            .selectFrom('tokens')
            .leftJoin('users', 'users.user_id', 'tokens.user_id')
            .select(['tokens.user_id', 'users.manager'])
            .where('tokens.token', '=', token.value as string)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth || auth.manager === -1) {
            // Only managers can create vehicles
        }

        const { plate, manufacture, model, year_manufacture, fuel, vin, mileage, countryId } = body;

        const result = await db
            .insertInto('fleetvehicles_vehicles')
            .values({
                plate,
                manufacture,
                model,
                year_manufacture: year_manufacture || new Date().getFullYear(),
                fuel: fuel as ValueExpression<Database, "fleetvehicles_vehicles", "petrol" | "diesel" | "hybrid(petrol)" | "hybrid(diesel)" | "electro" | "CNG" | "LNG" | "LPG" | "H2"> || 'petrol',
                vin: vin || null,
                mileage: mileage || 0,
                manufacture_country_id: countryId || 1,
                registration_country_id: countryId || 1,
                periodic_maintenance_mileage: 15000,
                location: null,
                notes: null
            })
            .execute();

        return Response.json({ vehicleId: Number(result[0].insertId), success: true });
    }, {
        body: t.Object({
            plate: t.String(),
            manufacture: t.String(),
            model: t.String(),
            year_manufacture: t.Optional(t.Number()),
            fuel: t.Optional(t.String()),
            vin: t.Optional(t.String()),
            mileage: t.Optional(t.Number()),
            countryId: t.Optional(t.Number())
        })
    })

    // Update vehicle
    .put('/vehicles/:id', async ({ params, body, cookie: { token } }) => {
        if (!token?.value) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const auth = await db
            .selectFrom('tokens')
            .select(['tokens.user_id'])
            .where('tokens.token', '=', token.value as string)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const vehicleId = parseInt(params.id);
        
        await db
            .updateTable('fleetvehicles_vehicles')
            .set(body as any)
            .where('vehicle_id', '=', vehicleId)
            .execute();

        return Response.json({ success: true });
    }, {
        params: t.Object({ id: t.String() }),
        body: t.Object({
            plate: t.Optional(t.String()),
            manufacture: t.Optional(t.String()),
            model: t.Optional(t.String()),
            mileage: t.Optional(t.Number()),
            location: t.Optional(t.String()),
            notes: t.Optional(t.String())
        })
    })

    // Delete vehicle
    .delete('/vehicles/:id', async ({ params, cookie: { token } }) => {
        if (!token?.value) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const auth = await db
            .selectFrom('tokens')
            .leftJoin('users', 'users.user_id', 'tokens.user_id')
            .select(['tokens.user_id', 'users.manager'])
            .where('tokens.token', '=', token.value as string)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth) {
            return Response.json({ error: 'forbidden' }, { status: 403 });
        }

        await db
            .deleteFrom('fleetvehicles_vehicles')
            .where('vehicle_id', '=', parseInt(params.id))
            .execute();

        return Response.json({ success: true });
    }, {
        params: t.Object({ id: t.String() })
    })

    // ==================== TRIPS ====================
    
    .get('/trips', async ({ query, cookie: { token } }) => {
        if (!token?.value) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const auth = await db
            .selectFrom('tokens')
            .select(['tokens.user_id'])
            .where('tokens.token', '=', token.value as string)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        let q = db
            .selectFrom('fleetvehicles_trips')
            .leftJoin('fleetvehicles_vehicles', 'fleetvehicles_vehicles.vehicle_id', 'fleetvehicles_trips.vehicle_id')
            .select([
                'fleetvehicles_trips.trip_id',
                'fleetvehicles_trips.vehicle_id',
                'fleetvehicles_vehicles.plate',
                'fleetvehicles_trips.start_date',
                'fleetvehicles_trips.end_date',
                'fleetvehicles_trips.purpose',
                'fleetvehicles_trips.driver_id',
                'fleetvehicles_trips.start_location',
                'fleetvehicles_trips.end_location',
                'fleetvehicles_trips.distance'
            ]);

        if (query.vehicleId) {
            q = q.where('fleetvehicles_trips.vehicle_id', '=', parseInt(query.vehicleId));
        }

        const trips = await q.orderBy('fleetvehicles_trips.start_date', 'desc').limit(50).execute();

        return Response.json({ trips });
    })

    // Create trip
    .post('/trips', async ({ body, cookie: { token } }) => {
        if (!token?.value) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const auth = await db
            .selectFrom('tokens')
            .leftJoin('users', 'users.user_id', 'tokens.user_id')
            .select(['tokens.user_id', 'users.person_id'])
            .where('tokens.token', '=', token.value as string)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth?.person_id) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const { vehicleId, purpose, start_location, end_location, distance } = body;

        const result = await db
            .insertInto('fleetvehicles_trips')
            .values({
                vehicle_id: vehicleId,
                driver_id: auth.person_id,
                purpose,
                start_location,
                end_location,
                distance: distance || 0,
                notes: ''
            })
            .execute();

        return Response.json({ tripId: Number(result[0].insertId), success: true });
    }, {
        body: t.Object({
            vehicleId: t.Number(),
            purpose: t.String(),
            start_location: t.String(),
            end_location: t.String(),
            distance: t.Optional(t.Number())
        })
    })

    // ==================== EXPENSES ====================
    
    .get('/expenses', async ({ query, cookie: { token } }) => {
        if (!token?.value) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const auth = await db
            .selectFrom('tokens')
            .select(['tokens.user_id'])
            .where('tokens.token', '=', token.value as string)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        let q = db
            .selectFrom('fleetvehicles_expenses')
            .leftJoin('fleetvehicles_vehicles', 'fleetvehicles_vehicles.vehicle_id', 'fleetvehicles_expenses.vehicle_id')
            .select([
                'fleetvehicles_expenses.fv_ex_id',
                'fleetvehicles_expenses.vehicle_id',
                'fleetvehicles_vehicles.plate',
                'fleetvehicles_expenses.expense_date',
                'fleetvehicles_expenses.amount',
                'fleetvehicles_expenses.description',
                'fleetvehicles_expenses.category'
            ]);

        if (query.vehicleId) {
            q = q.where('fleetvehicles_expenses.vehicle_id', '=', parseInt(query.vehicleId));
        }

        const expenses = await q.orderBy('fleetvehicles_expenses.expense_date', 'desc').limit(50).execute();

        return Response.json({ expenses });
    })

    // Create expense
    .post('/expenses', async ({ body, cookie: { token } }) => {
        if (!token?.value) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const auth = await db
            .selectFrom('tokens')
            .select(['tokens.user_id'])
            .where('tokens.token', '=', token.value as string)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const { vehicleId, amount, description, category } = body;

        const result = await db
            .insertInto('fleetvehicles_expenses')
            .values({
                vehicle_id: vehicleId,
                amount: amount.toString(),
                description,
                category: category as any,
                created_by: auth.user_id
            })
            .execute();

        return Response.json({ expenseId: Number(result[0].insertId), success: true });
    }, {
        body: t.Object({
            vehicleId: t.Number(),
            amount: t.Number(),
            description: t.String(),
            category: t.String()
        })
    })

    // ==================== OVERVIEW ====================
    
    .get('/overview', async ({ cookie: { token } }) => {
        if (!token?.value) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const auth = await db
            .selectFrom('tokens')
            .select(['tokens.user_id'])
            .where('tokens.token', '=', token.value as string)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        // Total vehicles
        const totalVehicles = await db
            .selectFrom('fleetvehicles_vehicles')
            .select(db.fn.count('vehicle_id').as('count'))
            .executeTakeFirst();

        // Total trips this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthlyTrips = await db
            .selectFrom('fleetvehicles_trips')
            .select(db.fn.count('trip_id').as('count'))
            .where('start_date', '>=', startOfMonth)
            .executeTakeFirst();

        // Total expenses this month
        const monthlyExpenses = await db
            .selectFrom('fleetvehicles_expenses')
            .select(db.fn.sum('amount').as('total'))
            .where('expense_date', '>=', startOfMonth)
            .executeTakeFirst();

        // Total distance this month
        const monthlyDistance = await db
            .selectFrom('fleetvehicles_trips')
            .select(db.fn.sum('distance').as('total'))
            .where('start_date', '>=', startOfMonth)
            .executeTakeFirst();

        return Response.json({
            stats: {
                totalVehicles: Number(totalVehicles?.count || 0),
                monthlyTrips: Number(monthlyTrips?.count || 0),
                monthlyExpenses: Number(monthlyExpenses?.total || 0),
                monthlyDistance: Number(monthlyDistance?.total || 0)
            }
        });
    });

export default app;
