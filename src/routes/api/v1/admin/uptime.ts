/**
 * System Uptime API
 * Vrací historii běhu systému z heartbeat záznamů.
 * GET /admin/analytics/uptime
 */
import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';
import { gitService } from '../../../../../version';
import { changelog } from '../../../../data/changelog.data';
import { updateService } from '../../../../functions/update.service';

interface UptimeSegment {
    status: 'online' | 'offline' | 'update';
    from: string;
    to: string;
    duration_minutes: number;
    version?: string;
    commit_hash?: string;
    note?: string | null;
}

/**
 * Rekonstruuje segmenty provozu z heartbeat záznamů.
 * Pravidlo: pokud je mezera > 2 min, systém byl offline.
 * Pokud je is_update=1, segment se označí jako 'update'.
 */
function buildSegments(beats: any[]): UptimeSegment[] {
    if (beats.length === 0) return [];

    const GAP_THRESHOLD_MS = 2 * 60 * 1000; // 2 minuty
    const segments: UptimeSegment[] = [];

    let segStart = new Date(beats[0].recorded_at);
    let segEnd   = new Date(beats[0].recorded_at);
    let isUpdate = beats[0].is_update === 1;
    let version  = beats[0].version;
    let commit   = beats[0].commit_hash;
    let note     = beats[0].note;

    for (let i = 1; i < beats.length; i++) {
        const prev = new Date(beats[i - 1].recorded_at);
        const curr = new Date(beats[i].recorded_at);
        const gap  = curr.getTime() - prev.getTime();

        if (gap > GAP_THRESHOLD_MS) {
            // Uzavři aktuální online segment
            segments.push({
                status: isUpdate ? 'update' : 'online',
                from: segStart.toISOString(),
                to: segEnd.toISOString(),
                duration_minutes: Math.round((segEnd.getTime() - segStart.getTime()) / 60000) + 1,
                version,
                commit_hash: commit,
                note
            });

            // Zapiš offline segment (mezera)
            segments.push({
                status: 'offline',
                from: prev.toISOString(),
                to: curr.toISOString(),
                duration_minutes: Math.round(gap / 60000)
            });

            // Začni nový online segment
            segStart = curr;
            isUpdate = beats[i].is_update === 1;
            version  = beats[i].version;
            commit   = beats[i].commit_hash;
            note     = beats[i].note;
        } else {
            // Stejný segment — posun konce a případná aktualizace is_update
            if (beats[i].is_update === 1) isUpdate = true;
        }

        segEnd = curr;
    }

    // Uzavři poslední segment
    segments.push({
        status: isUpdate ? 'update' : 'online',
        from: segStart.toISOString(),
        to: segEnd.toISOString(),
        duration_minutes: Math.round((segEnd.getTime() - segStart.getTime()) / 60000) + 1,
        version,
        commit_hash: commit,
        note
    });

    return segments.reverse(); // nejnovější první
}

export default new Elysia({ prefix: '/admin/analytics' })
    .get('/uptime', async ({ query, set }) => {
        // Rozsah: posledních N dní (default 7)
        const days = Math.min(Number(query.days) || 7, 90);

        try {
            const beats = await db
                .selectFrom('system_heartbeats')
                .select([
                    'recorded_at',
                    'version',
                    'commit_hash',
                    'is_update',
                    'note'
                ])
                .where(
                    'recorded_at', '>=',
                    sql<Date>`NOW() - INTERVAL ${sql.raw(String(days))} DAY`
                )
                .orderBy('recorded_at', 'asc')
                .execute();

            const segments = buildSegments(beats);

            // Výpočet celkové dostupnosti
            const totalMinutes = days * 24 * 60;
            const onlineMinutes = segments
                .filter(s => s.status === 'online' || s.status === 'update')
                .reduce((acc, s) => acc + s.duration_minutes, 0);
            const uptimePercent = totalMinutes > 0
                ? Math.min(100, parseFloat(((onlineMinutes / totalMinutes) * 100).toFixed(2)))
                : 0;

            // Aktuální stav systému
            const currentVersion = changelog[0]?.version ?? 'unknown';
            const currentCommit  = gitService.localCommit ?? 'unknown';
            const updateStatus   = updateService.getStatus();

            return {
                current: {
                    status: updateStatus.isUpdating ? 'update' : 'online',
                    version: currentVersion,
                    commit_hash: currentCommit,
                    uptime_percent: uptimePercent,
                    update_progress: updateStatus.progress,
                    update_error: updateStatus.error
                },
                segments,
                stats: {
                    days,
                    total_minutes: totalMinutes,
                    online_minutes: onlineMinutes,
                    uptime_percent: uptimePercent,
                    beat_count: beats.length
                }
            };
        } catch (err) {
            console.error('[Uptime API] Error:', err);
            set.status = 500;
            return { error: 'Failed to fetch uptime data' };
        }
    }, {
        query: t.Object({
            days: t.Optional(t.String())
        })
    });
