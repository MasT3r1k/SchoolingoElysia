
import { db } from './src/database';
import { sql } from 'kysely';

async function migrate() {
    console.log('Spouštím migraci email_config...');
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS email_config (
                config_id INT PRIMARY KEY AUTO_INCREMENT,
                school_id INT NOT NULL,
                provider VARCHAR(50) DEFAULT 'basic_smtp',
                host VARCHAR(255) NOT NULL,
                port INT DEFAULT 587,
                username VARCHAR(255),
                password VARCHAR(255),
                encryption ENUM('none', 'ssl', 'tls') DEFAULT 'tls',
                from_email VARCHAR(255) NOT NULL,
                from_name VARCHAR(255) DEFAULT 'Schoolingo',
                enabled BOOLEAN DEFAULT FALSE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (school_id) REFERENCES schools(schoolId) ON DELETE CASCADE
            )
        `.execute(db);
        console.log('Tabulka email_config byla úspěšně vytvořena.');
    } catch (e) {
        console.error('Chyba při migraci:', e);
    } finally {
        process.exit(0);
    }
}

migrate();
