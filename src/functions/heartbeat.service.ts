/**
 * Heartbeat Service
 *
 * Každých 60 sekund ukládá do DB záznam, že systém stále běží.
 * Z těchto záznamů je pak možné zpětně rekonstruovat:
 *   - kdy systém běžel
 *   - kdy byl offline (mezery v záznamu)
 *   - kdy probíhal update
 *   - jakou verzi měl v daném čase
 */
import { db } from '../../database';
import { sql } from 'kysely';
import { gitService } from '../../version';
import { changelog } from '../data/changelog.data';
import { updateService } from './update.service';

const HEARTBEAT_INTERVAL_MS = 60 * 1000; // každých 60 sekund

class HeartbeatService {
    private intervalId: NodeJS.Timeout | null = null;

    /** Zajistí existenci tabulky (idempotentní) */
    async ensureTable(): Promise<void> {
        try {
            await sql`
                CREATE TABLE IF NOT EXISTS system_heartbeats (
                    heartbeat_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
                    recorded_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    version      VARCHAR(32)  NOT NULL DEFAULT '',
                    commit_hash  VARCHAR(64)  NOT NULL DEFAULT '',
                    is_update    TINYINT(1)   NOT NULL DEFAULT 0,
                    note         VARCHAR(255)          DEFAULT NULL,
                    PRIMARY KEY (heartbeat_id),
                    INDEX idx_recorded_at (recorded_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            `.execute(db);
        } catch (err) {
            console.error('[Heartbeat] Failed to ensure table:', err);
        }
    }

    /** Zapíše jeden záznam do DB */
    private async beat(note: string | null = null): Promise<void> {
        try {
            const version = changelog[0]?.version ?? 'unknown';
            const commitHash = gitService.localCommit ?? 'unknown';
            const isUpdate = updateService.getStatus().isUpdating ? 1 : 0;

            await db.insertInto('system_heartbeats').values({
                version,
                commit_hash: commitHash,
                is_update: isUpdate,
                note
            }).execute();
        } catch (err) {
            // Tiše ignorujeme—není kritické
            console.warn('[Heartbeat] Write failed:', (err as any)?.message);
        }
    }

    /** Spustí pravidelný heartbeat a zapíše startup záznam */
    async start(): Promise<void> {
        await this.ensureTable();
        await this.beat('startup');

        this.intervalId = setInterval(() => {
            this.beat();
        }, HEARTBEAT_INTERVAL_MS);

        console.log('[💓 Heartbeat]: Service started (interval: 60 s)');
    }

    /** Zapíše shutdown záznam a zastaví interval */
    async stop(): Promise<void> {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        await this.beat('shutdown');
        console.log('[💓 Heartbeat]: Service stopped');
    }
}

export const heartbeatService = new HeartbeatService();
