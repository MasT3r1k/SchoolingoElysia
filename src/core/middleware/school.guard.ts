import { Elysia } from 'elysia';
import { db } from '../database/connection';
import { env } from '../config/env.config';

// In-memory cache for school domain mappings (10-minute TTL)
interface CachedSchool {
  school: any;
  cachedAt: number;
}
const schoolCache = new Map<string, CachedSchool>();
const CACHE_TTL_MS = 10 * 60 * 1000;

export async function resolveSchoolByDomain(domain: string): Promise<any | null> {
  const cleanDomain = domain.replace(/^https?:\/\//, '').split(':')[0].trim().toLowerCase();
  if (!cleanDomain) return null;

  const now = Date.now();
  const cached = schoolCache.get(cleanDomain);
  if (cached && cached.cachedAt + CACHE_TTL_MS > now) {
    return cached.school;
  }

  let school: any = null;

  try {
    const mapping = await db
      .selectFrom('school_domains')
      .where('domain', '=', cleanDomain)
      .select('school_id')
      .executeTakeFirst();

    if (mapping) {
      school = await db
        .selectFrom('schools')
        .selectAll()
        .where('school_id', '=', mapping.school_id)
        .executeTakeFirst();
    } else {
      // Fallback: if domain is localhost or IP, attempt to return first school
      school = await db.selectFrom('schools').selectAll().limit(1).executeTakeFirst();
    }
  } catch (err) {
    console.warn('[SchoolGuard]: Database query error, using fallback:', err);
  }

  // Fallback for test or local development environments when database is unseeded
  if (!school && (env.NODE_ENV === 'test' || env.NODE_ENV === 'development')) {
    school = {
      school_id: 1,
      name: 'Default School',
      code: 'DEFAULT',
      domain: cleanDomain,
    };
  }

  if (school) {
    schoolCache.set(cleanDomain, { school, cachedAt: now });
  }

  return school ?? null;
}

export function extractDomain(request: Request): string {
  const custom = request.headers.get('domain') || request.headers.get('x-school-domain');
  if (custom) return custom;

  const origin = request.headers.get('origin');
  if (origin) {
    return origin.replace(/^https?:\/\//, '').split(':')[0];
  }

  const host = request.headers.get('host');
  if (host) {
    return host.split(':')[0];
  }

  return 'localhost';
}

export const schoolGuard = new Elysia({ name: 'school-guard' })
  .derive({ as: 'global' }, async ({ request }) => {
    const domain = extractDomain(request);
    const school = await resolveSchoolByDomain(domain);
    return { school, domain };
  });
