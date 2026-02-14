import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('8888'),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().default('3306'),
  DB_USER: z.string().default('root'),
  DB_PASS: z.string().default('root'),
  DB_NAME: z.string().default('schoolingo'),
  DB_CONNECTION_LIMIT: z.string().default('10'),
  CORS_ORIGIN: z.string().default('*'),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX: z.string().default('100'),
  STMP_ENABLED: z.optional(z.string()),
  STMP_HOST: z.optional(z.string()),
  STMP_PORT: z.optional(z.string()),
  STMP_USER: z.optional(z.string()),
  STMP_PASS: z.optional(z.string()),
  STMP_EMAIL:z.optional(z.string()),
  STMP_NAME: z.optional(z.string()).default('Schoolingo'),
  MYSQLDUMP_PATH: z.string().default('mysqldump'),
  MYSQL_PATH: z.string().default('mysql'),
});

export const config = envSchema.parse(process.env);

export type Config = z.infer<typeof envSchema>; 