import { db } from '../../database';

async function run() {
    await db.schema.createTable('messages_drafts')
        .ifNotExists()
        .addColumn('draft_id', 'integer', (col) => col.primaryKey().autoIncrement())
        .addColumn('author_id', 'integer', (col) => col.notNull())
        .addColumn('type', 'integer', (col) => col.notNull().defaultTo(0))
        .addColumn('topic', 'varchar(255)')
        .addColumn('message', 'text')
        .addColumn('receivers', 'json')
        .addColumn('require_confirm', 'boolean', (col) => col.notNull().defaultTo(false))
        .addColumn('updated_at', 'timestamp', (col) => col.notNull())
        .execute();

    console.log('Successfully created messages_drafts table.');
    process.exit(0);
}

run().catch((e) => {
    console.error(e);
    process.exit(1);
});
