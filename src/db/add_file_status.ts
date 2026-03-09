import { db } from '../../database';

async function run() {
    try {
        await db.schema.alterTable('files')
            .addColumn('status', 'integer', (col) => col.notNull().defaultTo(0))
            .execute();

        console.log('Successfully added status column to files table.');
    } catch (e) {
        console.warn('Column status might already exist or error:', e);
    }
    process.exit(0);
}

run().catch((e) => {
    console.error(e);
    process.exit(1);
});
