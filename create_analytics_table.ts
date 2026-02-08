import 'dotenv/config';
import { db } from './database';
import { sql } from 'kysely';

async function up() {
  console.log('Creating analytics_visits table...');

  try {
    await db.schema
      .createTable('analytics_visits')
      .ifNotExists()
      .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
      .addColumn('user_id', 'integer')
      .addColumn('visitor_id', 'varchar(255)', (col) => col.notNull())
      .addColumn('url', 'text', (col) => col.notNull())
      .addColumn('path', 'varchar(255)', (col) => col.notNull())
      .addColumn('method', 'varchar(10)', (col) => col.notNull())
      .addColumn('ip_address', 'varchar(45)')
      .addColumn('user_agent', 'text')
      .addColumn('timestamp', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
      .addColumn('duration', 'integer')
      .execute();

    console.log('Table analytics_visits created successfully or already exists.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1); 
  }

  process.exit(0);
}

up();
