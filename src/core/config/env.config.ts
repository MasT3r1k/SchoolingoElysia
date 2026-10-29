import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(8888),
  HOST: z.string().default('0.0.0.0'),

  // Database
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(3306),
  DB_USER: z.string().default('root'),
  DB_PASS: z.string().default('root'),
  DB_NAME: z.string().default('schoolingo'),
  DB_CONNECTION_LIMIT: z.coerce.number().default(10),

  // Security & Rate Limiting
  CORS_ORIGIN: z.string().default('*'),
  RATE_LIMIT_ENABLED: z.coerce.boolean().default(true),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000), // 1 minute sliding window
  RATE_LIMIT_MAX: z.coerce.number().default(300), // 300 requests per minute
  RATE_LIMIT_AUTH_MAX: z.coerce.number().default(30), // 30 auth attempts per window
  SESSION_SECRET: z.string().default('schoolingo-secure-session-key-random-bytes-32'),
  QR_SECRET: z.string().default('schoolingo-qr-secret-change-in-production'),
  CSRF_SECRET: z.string().default('schoolingo-csrf-secret-change-in-production'),
  LDAP_SECRET: z.string().default('default_schoolingo_ldap_secret_key'),

  // Sentry
  SENTRY_DSN: z.string().optional().default('https://03784c4290d57b97a9a9ddcd33e601e4@o4511418028392448.ingest.de.sentry.io/4512334581006416'),
  SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().default(1.0),

  // SMTP Mailer
  STMP_ENABLED: z.coerce.boolean().default(false),
  STMP_HOST: z.string().optional().default(''),
  STMP_PORT: z.coerce.number().default(587),
  STMP_USER: z.string().optional().default(''),
  STMP_PASS: z.string().optional().default(''),
  STMP_EMAIL: z.string().optional().default(''),
  STMP_NAME: z.string().default('Schoolingo'),

  // MySQL CLI Paths
  MYSQLDUMP_PATH: z.string().default('mysqldump'),
  MYSQL_PATH: z.string().default('mysql'),

  // OAuth Providers
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  MICROSOFT_CLIENT_ID: z.string().optional(),
  MICROSOFT_CLIENT_SECRET: z.string().optional(),
  MICROSOFT_TENANT_ID: z.string().optional(),

  DEV_IP: z.string().optional(),
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
