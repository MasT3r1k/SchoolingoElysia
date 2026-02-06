/**
 * Fleet Vehicles API Endpoints
 * CRUD for vehicles, trips, expenses
 */
import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';

const app = new Elysia()
    // ==================== VEHICLES ====================
    
    // List all vehicles
    .get('/vehicles', async ({ cookie: { token } }) => {
        if (!token?.value) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const auth = await db
            .selectFrom('tokens')
            .select(['tokens.userId'])
            .where('tokens.token', '=', token.value)
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
            .select(['tokens.userId'])
            .where('tokens.token', '=', token.value)
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
            .where('vehicleId', '=', vehicleId)
            .executeTakeFirst();

        if (!vehicle) {
            return Response.json({ error: 'not_found' }, { status: 404 });
        }

        // Get related trips
        const trips = await db
            .selectFrom('fleetvehicles_trips')
            .selectAll()
            .where('vehicleId', '=', vehicleId)
            .orderBy('start_date', 'desc')
            .limit(10)
            .execute();

        // Get related expenses
        const expenses = await db
            .selectFrom('fleetvehicles_expenses')
            .selectAll()
            .where('vehicleId', '=', vehicleId)
            .orderBy('expense_date', 'desc')
            .limit(10)
            .execute();

        // Get maintenance records
        const maintenance = await db
            .selectFrom('fleetvehicles_maintenance')
            .selectAll()
            .where('vehicleId', '=', vehicleId)
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
            .leftJoin('users', 'users.userId', 'tokens.userId')
            .select(['tokens.userId', 'users.manager'])
            .where('tokens.token', '=', token.value)
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
                fuel: fuel || 'petrol',
                vin: vin || null,
                mileage: mileage || 0,
                countryId_manufacture: countryId || 1,
                registration_countryId: countryId || 1,
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
            .select(['tokens.userId'])
            .where('tokens.token', '=', token.value)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const vehicleId = parseInt(params.id);
        
        await db
            .updateTable('fleetvehicles_vehicles')
            .set(body as any)
            .where('vehicleId', '=', vehicleId)
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
            .leftJoin('users', 'users.userId', 'tokens.userId')
            .select(['tokens.userId', 'users.manager'])
            .where('tokens.token', '=', token.value)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth) {
            return Response.json({ error: 'forbidden' }, { status: 403 });
        }

        await db
            .deleteFrom('fleetvehicles_vehicles')
            .where('vehicleId', '=', parseInt(params.id))
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
            .select(['tokens.userId'])
            .where('tokens.token', '=', token.value)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        let q = db
            .selectFrom('fleetvehicles_trips')
            .leftJoin('fleetvehicles_vehicles', 'fleetvehicles_vehicles.vehicleId', 'fleetvehicles_trips.vehicleId')
            .select([
                'fleetvehicles_trips.tripId',
                'fleetvehicles_trips.vehicleId',
                'fleetvehicles_vehicles.plate',
                'fleetvehicles_trips.start_date',
                'fleetvehicles_trips.end_date',
                'fleetvehicles_trips.purpose',
                'fleetvehicles_trips.driverId',
                'fleetvehicles_trips.start_location',
                'fleetvehicles_trips.end_location',
                'fleetvehicles_trips.distance'
            ]);

        if (query.vehicleId) {
            q = q.where('fleetvehicles_trips.vehicleId', '=', parseInt(query.vehicleId));
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
            .leftJoin('users', 'users.userId', 'tokens.userId')
            .select(['tokens.userId', 'users.person'])
            .where('tokens.token', '=', token.value)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth?.person) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const { vehicleId, purpose, start_location, end_location, distance } = body;

        const result = await db
            .insertInto('fleetvehicles_trips')
            .values({
                vehicleId,
                driverId: auth.person,
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
            .select(['tokens.userId'])
            .where('tokens.token', '=', token.value)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        let q = db
            .selectFrom('fleetvehicles_expenses')
            .leftJoin('fleetvehicles_vehicles', 'fleetvehicles_vehicles.vehicleId', 'fleetvehicles_expenses.vehicleId')
            .select([
                'fleetvehicles_expenses.fvexId',
                'fleetvehicles_expenses.vehicleId',
                'fleetvehicles_vehicles.plate',
                'fleetvehicles_expenses.expense_date',
                'fleetvehicles_expenses.amount',
                'fleetvehicles_expenses.description',
                'fleetvehicles_expenses.category'
            ]);

        if (query.vehicleId) {
            q = q.where('fleetvehicles_expenses.vehicleId', '=', parseInt(query.vehicleId));
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
            .select(['tokens.userId'])
            .where('tokens.token', '=', token.value)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const { vehicleId, amount, description, category } = body;

        const result = await db
            .insertInto('fleetvehicles_expenses')
            .values({
                vehicleId,
                amount: amount.toString(),
                description,
                category: category as any,
                createdBy: auth.userId
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
            .select(['tokens.userId'])
            .where('tokens.token', '=', token.value)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        // Total vehicles
        const totalVehicles = await db
            .selectFrom('fleetvehicles_vehicles')
            .select(db.fn.count('vehicleId').as('count'))
            .executeTakeFirst();

        // Total trips this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthlyTrips = await db
            .selectFrom('fleetvehicles_trips')
            .select(db.fn.count('tripId').as('count'))
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
