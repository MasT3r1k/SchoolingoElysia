/**
 * System Update Service
 * Handles automatic and manual updates, SQL migrations, and rollbacks
 */
import { exec, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { db } from '../../database';
import { config } from '../config/app.config';
import { backupService } from './backup.service';
import { gitService } from '../../version';

import { sql } from 'kysely';

const execAsync = promisify(exec);

interface UpdateStatus {
    isUpdating: boolean;
    lastCheck: Date | null;
    error: string | null;
    progress: string;
}

class UpdateService {
    private status: UpdateStatus = {
        isUpdating: false,
        lastCheck: null,
        error: null,
        progress: 'Idle'
    };

    private migrationsDir: string;
    private schedulerInterval?: NodeJS.Timeout;

    constructor() {
        this.migrationsDir = path.join(__dirname, '../../migrations');
        if (!fs.existsSync(this.migrationsDir)) {
            fs.mkdirSync(this.migrationsDir, { recursive: true });
        }
        this.ensureMigrationsTable();
    }

    private async ensureMigrationsTable() {
        try {
            // Check if table exists (MySQL syntax)
            const exists = await (db as any).selectFrom('information_schema.tables')
                .select('table_name')
                .where('table_schema', '=', config.DB_NAME)
                .where('table_name', '=', '_migrations')
                .executeTakeFirst();

            if (!exists) {
                console.log('[Update] Creating _migrations table...');
                await db.schema.createTable('_migrations')
                    .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
                    .addColumn('name', 'varchar(255)', (col) => col.notNull().unique())
                    .addColumn('applied_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
                    .execute();
                console.log('[Update] _migrations table created.');
            }
        } catch (err) {
            console.error('[Update] Failed to ensure migrations table:', err);
        }
    }

    getStatus(): UpdateStatus {
        return { ...this.status, lastCheck: this.status.lastCheck };
    }

    /**
     * Trigger a manual update
     */
    async performUpdate(isAuto = false): Promise<{ success: boolean; message: string }> {
        if (this.status.isUpdating) {
            return { success: false, message: 'Update already in progress' };
        }

        this.status.isUpdating = true;
        this.status.error = null;
        this.status.progress = 'Checking for updates...';

        try {
            // 1. Check if update is needed
            await gitService.refreshRemote();
            const counts = await gitService.getAheadBehindCount();

            // Only update if we are NOT ahead and there are commits to pull (behind > 0)
            if (counts.behind === 0) {
                this.status.isUpdating = false;
                this.status.progress = 'Idle';
                // Only log if manual or if we want to see it (but let's make it silent for auto)
                if (!isAuto) {
                    console.log(`[Update] Skipping update: ${counts.ahead > 0 ? 'Local version is newer' : 'Already up to date'}`);
                }
                return { success: true, message: counts.ahead > 0 ? 'Local version is newer' : 'Already up to date' };
            }

            console.log(`[Update] Starting ${isAuto ? 'automatic' : 'manual'} update (Behind: ${counts.behind})...`);
            const previousCommit = gitService.localCommit;

            // 2. Backup Database
            this.status.progress = 'Backing up database...';
            const backup = await backupService.createBackup('Pre-update backup');
            console.log(`[Update] Created pre-update backup: ${backup.filename}`);

            // 3. Pull latest changes
            this.status.progress = 'Pulling latest changes...';
            try {
                await execAsync('git pull origin main');
                console.log('[Update] Pulled latest changes.');
            } catch (GitErr: any) {
                throw new Error(`Git pull failed: ${GitErr.message}`);
            }

            // 4. Run SQL Migrations
            this.status.progress = 'Running SQL migrations...';
            try {
                await this.runMigrations();
            } catch (MigErr: any) {
                console.error('[Update] Migration failed, rolling back files...');
                await execAsync(`git reset --hard ${previousCommit}`);
                throw MigErr;
            }

            // 5. Success
            this.status.progress = 'Update successful. Restarting...';
            console.log('[Update] Update completed successfully.');
            
            // In a real environment, we'd trigger a restart here.
            // For now, we'll signal success and maybe the process manager handles the file changes.
            setTimeout(() => {
                this.status.isUpdating = false;
                this.status.progress = 'Successful (Restart pending)';
                // Trigger process exit if managed by PM2/Docker
                // process.exit(0); 
            }, 2000);

            return { success: true, message: 'Update successful' };

        } catch (err: any) {
            this.status.error = err.message;
            this.status.isUpdating = false;
            this.status.progress = 'Failed';
            console.error('[Update] Update failed:', err.message);
            return { success: false, message: err.message };
        }
    }

    /**
     * Run any pending SQL migrations
     */
    private async runMigrations() {
        const files = fs.readdirSync(this.migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort();

        const applied = await db.selectFrom('_migrations').select('name').execute();
        const appliedNames = new Set(applied.map(a => a.name));

        for (const file of files) {
            if (!appliedNames.has(file)) {
                console.log(`[Update] Applying migration: ${file}`);
                const sqlContent = fs.readFileSync(path.join(this.migrationsDir, file), 'utf8');
                
                // We split by semicolon to run multiple statements if needed, 
                // but simple execution might be safer depending on the driver.
                // Kysely doesn't directly support raw multi-statement strings well in all dialects.
                // We'll use the raw connection for this.
                
                try {
                    // Split content by ; but only if it's not inside quotes/comments (advanced)
                    // For simplicity, we assume separate statements or small enough files.
                    const statements = sqlContent.split(';').filter(s => s.trim() !== '');
                    
                    for (const statement of statements) {
                        await sql`${sql.raw(statement)}`.execute(db);
                    }

                    await db.insertInto('_migrations').values({ name: file }).execute();
                    console.log(`[Update] Applied migration: ${file}`);
                } catch (err: any) {
                    throw new Error(`Migration ${file} failed: ${err.message}`);
                }
            }
        }
    }

    /**
     * Rollback to a specific backup and previous code state
     */
    async rollback(backupFilename: string, commitHash?: string): Promise<{ success: boolean; message: string }> {
        if (this.status.isUpdating) return { success: false, message: 'Update in progress' };
        
        this.status.isUpdating = true;
        this.status.progress = 'Rolling back...';
        
        try {
            // Find backup info to get associated commit if not provided
            if (!commitHash) {
                const backups = await backupService.listBackups();
                const selected = backups.find(b => b.filename === backupFilename);
                if (selected && selected.commitHash) {
                    commitHash = selected.commitHash;
                    console.log(`[Update] Found associated commit for rollback: ${commitHash}`);
                }
            }

            // 1. Rollback code if commit provided/found
            if (commitHash) {
                this.status.progress = 'Rolling back code...';
                await execAsync(`git reset --hard ${commitHash}`);
                console.log(`[Update] Code rolled back to ${commitHash}`);
            }

            // 2. Restore database
            this.status.progress = 'Restoring database...';
            await backupService.restoreBackup(backupFilename);

            this.status.isUpdating = false;
            this.status.progress = 'Rollback complete';
            return { success: true, message: 'Rollback successful' };
        } catch (err: any) {
            this.status.error = err.message;
            this.status.isUpdating = false;
            this.status.progress = 'Rollback failed';
            return { success: false, message: err.message };
        }
    }

    /**
     * Automatic Update Scheduler
     */
    startScheduler(intervalHours: number) {
        if (this.schedulerInterval) clearInterval(this.schedulerInterval);
        
        // Safety: ensure interval is at least 1 hour and is a valid number
        const safeIntervalHours = Math.max(1, (typeof intervalHours === 'number' && !isNaN(intervalHours)) ? intervalHours : 24);
        
        console.log(`[Update] Starting automatic update check: every ${safeIntervalHours} hours`);
        this.schedulerInterval = setInterval(async () => {
            this.status.lastCheck = new Date();
            await this.performUpdate(true);
        }, safeIntervalHours * 60 * 60 * 1000);
    }

    stopScheduler() {
        if (this.schedulerInterval) {
            clearInterval(this.schedulerInterval);
            this.schedulerInterval = undefined;
        }
    }
}

export const updateService = new UpdateService();
