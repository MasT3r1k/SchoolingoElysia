import { db } from './database.ts';

async function up() {
    await db.schema
        .createTable('message_recipient_groups')
        .addColumn('group_id', 'integer', (col) => col.primaryKey().autoIncrement())
        .addColumn('name', 'varchar(255)', (col) => col.notNull())
        .addColumn('author_id', 'integer', (col) => col.notNull())
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo(new Date()))
        .execute();

    await db.schema
        .createTable('message_recipient_group_members')
        .addColumn('group_id', 'integer', (col) => col.notNull())
        .addColumn('person_id', 'integer', (col) => col.notNull())
        .addPrimaryKeyConstraint('pk_group_members', ['group_id', 'person_id'])
        .execute();
}

up().then(() => console.log('Done')).catch(console.error);
