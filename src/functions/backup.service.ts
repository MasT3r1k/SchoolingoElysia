/**
 * Database Backup Service
 * Automatic database backup with scheduling and management
 */
import { exec, execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { config } from '../config/app.config';
import { db } from '../../database';

const execAsync = promisify(exec);

// Backup configuration
const BACKUP_CONFIG = {
    // Directory to store backups
    backupDir: process.env.BACKUP_DIR || path.join(__dirname, '../../backups'),
    // Maximum number of backups to keep
    maxBackups: parseInt(process.env.MAX_BACKUPS || '30'),
    // Backup interval in hours (for scheduler)
    backupIntervalHours: parseInt(process.env.BACKUP_INTERVAL_HOURS || '24'),
    // Compress backups
    compress: process.env.BACKUP_COMPRESS !== 'false'
};

interface BackupInfo {
    filename: string;
    path: string;
    size: number;
    createdAt: Date;
    compressed: boolean;
    commitHash?: string;
}

class DatabaseBackupService {
    private backupDir: string;
    private schedulerInterval?: NodeJS.Timeout;

    constructor() {
        this.backupDir = BACKUP_CONFIG.backupDir;
        this.ensureBackupDirectory();
    }

    /**
     * Ensure backup directory exists
     */
    private ensureBackupDirectory(): void {
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
            console.log(`[Backup] Created backup directory: ${this.backupDir}`);
        }
    }

    /**
     * Generate backup filename with timestamp
     */
    private generateFilename(): string {
        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
        return `schoolingo_backup_${timestamp}.sql`;
    }

    /**
     * Create database backup
     */
    async createBackup(description?: string): Promise<BackupInfo> {
        this.ensureBackupDirectory();
        
        const filename = this.generateFilename();
        const filepath = path.join(this.backupDir, filename);
        
        let commitHash: string | null = null;
        try {
            commitHash = execSync('git rev-parse HEAD').toString().trim();
        } catch (e) {
            console.warn('[Backup] Could not get current commit hash');
        }

        console.log(`[Backup] Starting backup: ${filename} (Commit: ${commitHash || 'unknown'})`);

        try {
            const { spawn } = require('child_process');
            
            // Prepare arguments for spawn
            const args = [
                '-h', config.DB_HOST,
                '-P', config.DB_PORT,
                '-u', config.DB_USER,
                config.DB_NAME,
                '--single-transaction',
                '--routines',
                '--triggers'
            ];
            
            // Add password if exists (be careful with process listing)
            // Note: passing password in args is insecure in shared environments, 
            // but config file is also an option. For now sticking to args to match previous logic
            if (config.DB_PASS) {
                args.push(`-p${config.DB_PASS}`);
            }

            // Create write stream
            const fileStream = fs.createWriteStream(filepath);

            await new Promise<void>((resolve, reject) => {
                const dumpProcess = spawn(config.MYSQLDUMP_PATH, args);

                dumpProcess.stdout.pipe(fileStream);

                dumpProcess.stderr.on('data', (data) => {
                    // Log stderr but don't fail immediately unless exit code is non-zero
                    // mysqldump often writes info to stderr
                    console.log(`[Backup] mysqldump stderr: ${data}`);
                });

                dumpProcess.on('error', (err) => {
                    reject(err);
                });

                dumpProcess.on('close', (code) => {
                    if (code === 0) {
                        resolve();
                    } else {
                        reject(new Error(`mysqldump exited with code ${code}`));
                    }
                });
                
                fileStream.on('error', (err) => {
                    reject(err);
                });
            });

            // Compress if enabled
            let finalPath = filepath;
            let compressed = false;

            if (BACKUP_CONFIG.compress) {
                try {
                    // Use gzip for compression
                    await execAsync(`gzip "${filepath}"`);
                    finalPath = `${filepath}.gz`;
                    compressed = true;
                } catch (compressErr) {
                    console.warn('[Backup] Compression failed, keeping uncompressed backup');
                }
            }

            // Get file stats
            const stats = fs.statSync(finalPath);

            // Log backup to database
            await this.logBackup(path.basename(finalPath), stats.size, description, commitHash);

            // Cleanup old backups
            await this.cleanupOldBackups();

            console.log(`[Backup] Completed: ${path.basename(finalPath)} (${this.formatSize(stats.size)})`);

            return {
                filename: path.basename(finalPath),
                path: finalPath,
                size: stats.size,
                createdAt: new Date(),
                compressed,
                commitHash: commitHash || undefined
            };
        } catch (error: any) {
            console.error('[Backup] Failed:', error.message);
            // Clean up partial file on failure
            if (fs.existsSync(filepath)) {
                try { fs.unlinkSync(filepath); } catch {}
            }
            throw new Error(`Backup failed: ${error.message}`);
        }
    }

    /**
     * List all backups
     */
    async listBackups(): Promise<BackupInfo[]> {
        this.ensureBackupDirectory();
        
        try {
            // Get from DB to have commit_hash
            const dbBackups = await db.selectFrom('backups')
                .select(['filename', 'size', 'created', 'commit_hash'])
                .orderBy('created', 'desc')
                .execute();

            const backups: BackupInfo[] = [];

            for (const b of dbBackups) {
                const filepath = path.join(this.backupDir, b.filename);
                // Only include if file actually exists on disk
                if (fs.existsSync(filepath)) {
                    backups.push({
                        filename: b.filename,
                        path: filepath,
                        size: b.size,
                        createdAt: b.created,
                        compressed: b.filename.endsWith('.gz'),
                        commitHash: b.commit_hash || undefined
                    });
                }
                // Also check if .gz version exists if we recorded .sql
                else if (fs.existsSync(filepath + '.gz')) {
                    const gzPath = filepath + '.gz';
                    const stats = fs.statSync(gzPath);
                    backups.push({
                        filename: b.filename + '.gz',
                        path: gzPath,
                        size: stats.size,
                        createdAt: b.created,
                        compressed: true,
                        commitHash: b.commit_hash || undefined
                    });
                }
            }

            // Fallback: if DB is empty, read files (e.g. during migration)
            if (backups.length === 0) {
                const files = fs.readdirSync(this.backupDir);
                for (const file of files) {
                    if (file.startsWith('schoolingo_backup_')) {
                        const filepath = path.join(this.backupDir, file);
                        const stats = fs.statSync(filepath);
                        backups.push({
                            filename: file,
                            path: filepath,
                            size: stats.size,
                            createdAt: stats.birthtime,
                            compressed: file.endsWith('.gz')
                        });
                    }
                }
            }

            return backups;
        } catch (err) {
            // Fallback to filesystem if DB fails
            const files = fs.readdirSync(this.backupDir);
            const backups: BackupInfo[] = [];
            for (const file of files) {
                const filepath = path.join(this.backupDir, file);
                const stats = fs.statSync(filepath);
                backups.push({
                    filename: file,
                    path: filepath,
                    size: stats.size,
                    createdAt: stats.birthtime,
                    compressed: file.endsWith('.gz')
                });
            }
            return backups;
        }
    }

    /**
     * Delete a specific backup
     */
    async deleteBackup(filename: string): Promise<void> {
        const filepath = path.join(this.backupDir, filename);
        
        if (!fs.existsSync(filepath)) {
            throw new Error('Backup not found');
        }

        await db
            .insertInto('auditlog')
            .values({
                userId: null, // System action
                type: 'backup_deleted',
                data: JSON.stringify({ action: 'database_backup', filename }),
                ip: null
            })
            .execute();

        fs.unlinkSync(filepath);
        console.log(`[Backup] Deleted: ${filename}`);
    }

    /**
     * Restore database from backup
     */
    async restoreBackup(filename: string): Promise<void> {
        const filepath = path.join(this.backupDir, filename);
        
        if (!fs.existsSync(filepath)) {
            throw new Error('Backup not found');
        }

        console.log(`[Backup] Starting restore from: ${filename}`);

        try {
            let sqlFile = filepath;
            
            // Decompress if needed
            if (filename.endsWith('.gz')) {
                await execAsync(`gunzip -k "${filepath}"`);
                sqlFile = filepath.replace('.gz', '');
            }

            // Restore using mysql
            const passFlag = config.DB_PASS ? `-p${config.DB_PASS}` : '';
            const restoreCmd = `"${config.MYSQL_PATH}" -h ${config.DB_HOST} -P ${config.DB_PORT} -u ${config.DB_USER} ${passFlag} ${config.DB_NAME} < "${sqlFile}"`;
            await execAsync(restoreCmd);

            // Clean up decompressed file if it was compressed
            if (filename.endsWith('.gz') && fs.existsSync(sqlFile)) {
                fs.unlinkSync(sqlFile);
            }

            await db
                .insertInto('auditlog')
                .values({
                    userId: null, // System action
                    type: 'backup_restored',
                    data: JSON.stringify({ action: 'database_backup', filename }),
                    ip: null
                })
                .execute();

            console.log(`[Backup] Restore completed from: ${filename}`);
        } catch (error: any) {
            console.error('[Backup] Restore failed:', error.message);
            throw new Error(`Restore failed: ${error.message}`);
        }
    }

    /**
     * Update the backup interval and restart scheduler if needed
     */
    updateInterval(hours: number): void {
        BACKUP_CONFIG.backupIntervalHours = hours;
        if (this.schedulerInterval) {
            this.stopScheduler();
            this.startScheduler();
        }
    }

    /**
     * Cleanup old backups (keep only maxBackups most recent)
     */
    private async cleanupOldBackups(): Promise<void> {
        const backups = await this.listBackups();
        
        if (backups.length > BACKUP_CONFIG.maxBackups) {
            const toDelete = backups.slice(BACKUP_CONFIG.maxBackups);
            
            for (const backup of toDelete) {
                fs.unlinkSync(backup.path);
                console.log(`[Backup] Cleaned up old backup: ${backup.filename}`);
            }
        }
    }

    /**
     * Log backup to database
     */
    private async logBackup(filename: string, size: number, description?: string, commitHash?: string | null): Promise<void> {
        try {
            // Log backup action to backups table
            await db
                .insertInto('backups')
                .values({
                    filename,
                    size,
                    type: description?.includes('Scheduled') ? 'auto' : 'manual',
                    status: 'success',
                    commit_hash: commitHash
                })
                .execute();

            // Also log to auditlog
            await db
                .insertInto('auditlog')
                .values({
                    userId: null, // System action
                    type: 'backup_created',
                    data: JSON.stringify({ action: 'database_backup', filename, size, description, commitHash }),
                    ip: null
                })
                .execute();
        } catch (err) {
            console.warn(`[Backup] Failed to log to DB: ${err}`);
        }
    }

    /**
     * Format file size for display
     */
    private formatSize(bytes: number): string {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unit = 0;
        
        while (size >= 1024 && unit < units.length - 1) {
            size /= 1024;
            unit++;
        }
        
        return `${size.toFixed(2)} ${units[unit]}`;
    }

    /**
     * Check if backup is needed based on last backup time
     */
    async checkAndBackup(): Promise<void> {
        try {
            const lastBackup = await db.selectFrom('backups')
                .select('created')
                .where('status', '=', 'success')
                .orderBy('created', 'desc')
                .executeTakeFirst();

            let shouldBackup = false;
            
            if (!lastBackup) {
                console.log('[Backup] No previous backups found. Initiating startup backup...');
                shouldBackup = true;
            } else {
                const now = new Date();
                const last = new Date(lastBackup.created);
                const diffMs = now.getTime() - last.getTime();
                const diffHours = diffMs / (1000 * 60 * 60);

                if (diffHours >= BACKUP_CONFIG.backupIntervalHours) {
                    console.log(`[Backup] Last backup was ${diffHours.toFixed(2)} hours ago (Interval: ${BACKUP_CONFIG.backupIntervalHours}h). Initiating startup backup...`);
                    shouldBackup = true;
                }
            }

            if (shouldBackup) {
                await this.createBackup('Scheduled automatic backup (Startup check)');
            }
        } catch (error) {
            console.error('[Backup] Startup check failed:', error);
        }
    }

    /**
     * Start automatic backup scheduler
     */
    async startScheduler(): Promise<void> {
        // Run startup check
        await this.checkAndBackup();

        const intervalMs = BACKUP_CONFIG.backupIntervalHours * 60 * 60 * 1000;
        
        console.log(`[Backup] Starting scheduler: every ${BACKUP_CONFIG.backupIntervalHours} hours`);
        
        this.schedulerInterval = setInterval(async () => {
            try {
                await this.createBackup('Scheduled automatic backup');
            } catch (error) {
                console.error('[Backup] Scheduled backup failed:', error);
            }
        }, intervalMs);
    }

    /**
     * Stop automatic backup scheduler
     */
    stopScheduler(): void {
        if (this.schedulerInterval) {
            clearInterval(this.schedulerInterval);
            this.schedulerInterval = undefined;
            console.log('[Backup] Scheduler stopped');
        }
    }
}

export const backupService = new DatabaseBackupService();
