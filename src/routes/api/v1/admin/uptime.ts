/**
 * System Uptime & API Metrics API
 * GET /admin/analytics/uptime          – uptime history from heartbeats
 * PATCH /admin/analytics/uptime/note   – add/edit note on an offline segment (by from-time)
 * GET /admin/analytics/response-time   – average API response time over time
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
function buildSegments(beats: any[], offlineNotes: Map<string, string>): UptimeSegment[] {
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
            const offlineFrom = prev.toISOString();
            segments.push({
                status: 'offline',
                from: offlineFrom,
                to: curr.toISOString(),
                duration_minutes: Math.round(gap / 60000),
                note: offlineNotes.get(offlineFrom) ?? null
            });

            // Začni nový online segment
            segStart = curr;
            isUpdate = beats[i].is_update === 1;
            version  = beats[i].version;
            commit   = beats[i].commit_hash;
            note     = beats[i].note;
        } else {
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
    // ─────────────────────────────────────────────────────
    // GET /uptime
    // ─────────────────────────────────────────────────────
    .get('/uptime', async ({ query, set }) => {
        let days = Math.min(Number(query.days) || 7, 90);
        let dateCondition = sql<boolean>`recorded_at >= NOW() - INTERVAL ${sql.raw(String(days))} DAY`;

        if (query.from && query.to) {
            dateCondition = sql<boolean>`DATE(recorded_at) >= ${query.from} AND DATE(recorded_at) <= ${query.to}`;
            const f = new Date(query.from);
            const tdate = new Date(query.to);
            days = Math.max(1, Math.ceil((tdate.getTime() - f.getTime()) / (1000 * 3600 * 24)) + 1);
        }

        try {
            const beats = await db
                .selectFrom('system_heartbeats')
                .select(['recorded_at', 'version', 'commit_hash', 'is_update', 'note'])
                .where(dateCondition)
                .orderBy('recorded_at', 'asc')
                .execute();

            // Load offline notes from the offline_notes table (if it exists)
            // Fall back gracefully if not yet migrated
            let offlineNotes = new Map<string, string>();
            try {
                const notes = await (db as any)
                    .selectFrom('uptime_offline_notes')
                    .select(['segment_from', 'note'])
                    .execute();
                for (const n of notes) {
                    offlineNotes.set(n.segment_from, n.note);
                }
            } catch { /* table doesn't exist yet */ }

            const segments = buildSegments(beats, offlineNotes);

            const totalMinutes = days * 24 * 60;
            const onlineMinutes = segments
                .filter(s => s.status === 'online' || s.status === 'update')
                .reduce((acc, s) => acc + s.duration_minutes, 0);
            const uptimePercent = totalMinutes > 0
                ? Math.min(100, parseFloat(((onlineMinutes / totalMinutes) * 100).toFixed(2)))
                : 0;

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
            days: t.Optional(t.String()),
            from: t.Optional(t.String()),
            to: t.Optional(t.String())
        })
    })

    // ─────────────────────────────────────────────────────
    // PATCH /uptime/note — save note for an offline segment
    // ─────────────────────────────────────────────────────
    .patch('/uptime/note', async ({ body, user, set }: any) => {
        if (!user) { set.status = 401; return { error: 'unauthorized' }; }
        if (!user.isPrincipal && user.manager == null) { set.status = 403; return { error: 'forbidden' }; }

        const { segment_from, note } = body as { segment_from: string; note: string };

        try {
            // Upsert into uptime_offline_notes
            await db.executeQuery(
                sql`
                    INSERT INTO uptime_offline_notes (segment_from, note, updated_at)
                    VALUES (${segment_from}, ${note}, NOW())
                    ON DUPLICATE KEY UPDATE note = ${note}, updated_at = NOW()
                `.compile(db as any)
            );
            return { success: true };
        } catch (err) {
            console.error('[Uptime Note] Error:', err);
            set.status = 500;
            return { error: 'Failed to save note' };
        }
    }, {
        body: t.Object({
            segment_from: t.String(),
            note: t.String()
        })
    });
