import { db } from './database';
import { sql } from 'kysely';

async function createTable() {
  console.log('--- Creating report_cards table ---');
  
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS report_cards (
        rc_id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        year INT NOT NULL,
        semester INT NOT NULL,
        issued_at DATETIME NOT NULL,
        issued_by INT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `.execute(db);
    console.log('Table report_cards created successfully.');
  } catch (err) {
    console.error('Error creating table:', err);
  }

  process.exit(0);
}

createTable();
