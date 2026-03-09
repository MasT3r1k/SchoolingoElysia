import { db } from '../../database';

async function run() {
    await db.schema.alterTable('documents')
        .addColumn('owner_id', 'integer')
        .execute();

    console.log('Successfully added owner_id to documents table.');
    process.exit(0);
}

run().catch((e) => {
    console.error(e);
    process.exit(1);
});
