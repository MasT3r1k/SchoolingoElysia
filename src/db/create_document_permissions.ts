import { db } from '../../database';

async function run() {
    await db.schema.createTable('document_permissions')
        .ifNotExists()
        .addColumn('document_permission_id', 'integer', (col) => col.primaryKey().autoIncrement())
        .addColumn('document_id', 'integer', (col) => col.notNull())
        .addColumn('role_id', 'integer')
        .addColumn('user_id', 'integer')
        .addColumn('permission_type', 'varchar(10)', (col) => col.notNull()) // READ, WRITE
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        .execute();

    console.log('Successfully created document_permissions table.');
    process.exit(0);
}

import { sql } from 'kysely';
run().catch((e) => {
    console.error(e);
    process.exit(1);
});
