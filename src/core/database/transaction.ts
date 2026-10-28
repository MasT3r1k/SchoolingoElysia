import type { Transaction } from 'kysely';
import type { Database } from '../../db/schemas';
import { db } from './connection';

export async function withTransaction<T>(
  callback: (trx: Transaction<Database>) => Promise<T>
): Promise<T> {
  return await db.transaction().execute(async (trx) => {
    return await callback(trx);
  });
}
