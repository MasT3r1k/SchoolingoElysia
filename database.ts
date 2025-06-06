import { Kysely, MysqlDialect } from 'kysely'
import { createPool } from 'mysql2'
import { Database } from './src/db/schemas'
import { config } from './src/config/app.config'
import { InternalServerError } from './src/utils/errors'

const pool = createPool({
    host: config.DB_HOST,
    port: parseInt(config.DB_PORT),
    user: config.DB_USER,
    password: config.DB_PASS,
    database: config.DB_NAME,
    connectionLimit: parseInt(config.DB_CONNECTION_LIMIT),
    waitForConnections: true,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
})

// Add connection error handling
pool.on('error', (err) => {
    console.error('Database connection error:', err)
    throw new InternalServerError('Database connection error')
})

// Add connection success logging
pool.on('connection', () => {
    console.log('[📦 Database]: New connection established')
})

const dialect = new MysqlDialect({ pool })

export const db = new Kysely<Database>({
    dialect,
    // Add query logging in development
    ...(config.NODE_ENV === 'development' && {
        log: (event) => {
            if (event.level === 'query') {
                console.log('[\uD83D\uDCE6 Database]:', event.query.sql, event.query.parameters)
            }
            if (event.level === 'error') {
                console.error('[\uD83D\uDCE6 Database Error]:', event.error)
            }
        }
    })
})