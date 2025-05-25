import { Kysely, MysqlDialect } from 'kysely'
import mysql from 'mysql2'
import { Database } from './db/schemas'
import 'dotenv/config';

export const db = new Kysely<Database>({
    dialect: new MysqlDialect({
        pool: mysql.createPool({
            host: process.env['DB_HOST'] || 'localhost',
            port: Number(process.env['DB_PORT']) || 3306,
            user: process.env['DB_USER'] || 'root',
            password: process.env['DB_PASS'] || 'root',
            database: process.env['DB_NAME'] || 'schoolingo',
            connectionLimit: process.env['DB_CONNECTION_LIMIT'] ? Number(process.env['DB_CONNECTION_LIMIT']) : 10,
        })
    })
})