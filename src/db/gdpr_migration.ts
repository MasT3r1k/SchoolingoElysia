import { db } from '../../database';
import { sql } from 'kysely';

async function run() {
    console.log('--- CREATING GDPR TABLES ---');

    // 1. gdpr_consents
    await db.schema.createTable('gdpr_consents')
        .ifNotExists()
        .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
        .addColumn('title', 'varchar(255)', (col) => col.notNull())
        .addColumn('type', 'varchar(50)', (col) => col.notNull())
        .addColumn('description', 'text')
        .addColumn('purpose', 'text')
        .addColumn('instructions', 'text')
        .addColumn('required', 'boolean', (col) => col.notNull().defaultTo(false))
        .addColumn('active', 'boolean', (col) => col.notNull().defaultTo(true))
        .addColumn('target_group', 'varchar(255)')
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        .execute();
    console.log('Table gdpr_consents created.');

    // 2. gdpr_user_consents
    await db.schema.createTable('gdpr_user_consents')
        .ifNotExists()
        .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
        .addColumn('user_id', 'integer', (col) => col.notNull())
        .addColumn('consent_id', 'integer', (col) => col.notNull())
        .addColumn('granted', 'boolean')
        .addColumn('granted_at', 'timestamp')
        .addColumn('expires_at', 'timestamp')
        .addColumn('person_id', 'integer')
        .execute();
    console.log('Table gdpr_user_consents created.');

    // 3. gdpr_training
    await db.schema.createTable('gdpr_training')
        .ifNotExists()
        .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
        .addColumn('name', 'varchar(255)', (col) => col.notNull())
        .addColumn('description', 'text')
        .addColumn('valid_days', 'integer')
        .addColumn('active', 'boolean', (col) => col.notNull().defaultTo(true))
        .addColumn('target_group', 'varchar(255)')
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        .execute();
    console.log('Table gdpr_training created.');

    // 4. gdpr_user_training
    await db.schema.createTable('gdpr_user_training')
        .ifNotExists()
        .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
        .addColumn('user_id', 'integer', (col) => col.notNull())
        .addColumn('training_id', 'integer', (col) => col.notNull())
        .addColumn('status', 'varchar(20)', (col) => col.notNull().defaultTo('not_started'))
        .addColumn('score', 'integer')
        .addColumn('completed_at', 'timestamp')
        .addColumn('expires_at', 'timestamp')
        .execute();
    console.log('Table gdpr_user_training created.');

    // 5. gdpr_requests
    await db.schema.createTable('gdpr_requests')
        .ifNotExists()
        .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
        .addColumn('user_id', 'integer', (col) => col.notNull())
        .addColumn('type', 'varchar(20)', (col) => col.notNull())
        .addColumn('status', 'varchar(20)', (col) => col.notNull().defaultTo('pending'))
        .addColumn('requested_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        .addColumn('completed_at', 'timestamp')
        .addColumn('download_url', 'text')
        .execute();
    console.log('Table gdpr_requests created.');

    // 6. gdpr_reports
    await db.schema.createTable('gdpr_reports')
        .ifNotExists()
        .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
        .addColumn('user_id', 'integer', (col) => col.notNull())
        .addColumn('type', 'varchar(20)', (col) => col.notNull())
        .addColumn('subject', 'varchar(255)', (col) => col.notNull())
        .addColumn('message', 'text', (col) => col.notNull())
        .addColumn('status', 'varchar(20)', (col) => col.notNull().defaultTo('new'))
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        .execute();
    console.log('Table gdpr_reports created.');

    // 7. gdpr_reviews
    await db.schema.createTable('gdpr_reviews')
        .ifNotExists()
        .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
        .addColumn('title', 'varchar(255)', (col) => col.notNull())
        .addColumn('description', 'text')
        .addColumn('date', 'date', (col) => col.notNull())
        .addColumn('status', 'varchar(20)', (col) => col.notNull().defaultTo('planned'))
        .addColumn('result', 'text')
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        .execute();
    console.log('Table gdpr_reviews created.');

    console.log('--- SEEDING INITIAL PERMISSIONS ---');
    // Assuming you have roles/permissions. We might want to add gdpr.admin permission.

    console.log('--- GDPR INITIALIZATION FINISHED ---');
    process.exit(0);
}

run().catch((e) => {
    console.error(e);
    process.exit(1);
});
