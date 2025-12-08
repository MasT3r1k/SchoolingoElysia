/**
 * Database Backup Service
 * Automatic database backup with scheduling and management
 */
import { exec } from 'child_process';
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
        
        console.log(`[Backup] Starting backup: ${filename}`);

        try {
            // Build mysqldump command
            const dumpCmd = `mysqldump -h ${config.DB_HOST} -P ${config.DB_PORT} -u ${config.DB_USER} -p${config.DB_PASS} ${config.DB_NAME} --single-transaction --routines --triggers`;
            
            // Execute backup
            const { stdout } = await execAsync(dumpCmd);
            
            // Write to file
            fs.writeFileSync(filepath, stdout);

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
            await this.logBackup(path.basename(finalPath), stats.size, description);

            // Cleanup old backups
            await this.cleanupOldBackups();

            console.log(`[Backup] Completed: ${path.basename(finalPath)} (${this.formatSize(stats.size)})`);

            return {
                filename: path.basename(finalPath),
                path: finalPath,
                size: stats.size,
                createdAt: new Date(),
                compressed
            };
        } catch (error: any) {
            console.error('[Backup] Failed:', error.message);
            throw new Error(`Backup failed: ${error.message}`);
        }
    }

    /**
     * List all backups
     */
    async listBackups(): Promise<BackupInfo[]> {
        this.ensureBackupDirectory();
        
        const files = fs.readdirSync(this.backupDir);
        const backups: BackupInfo[] = [];

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

        // Sort by date (newest first)
        backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        return backups;
    }

    /**
     * Delete a specific backup
     */
    async deleteBackup(filename: string): Promise<void> {
        const filepath = path.join(this.backupDir, filename);
        
        if (!fs.existsSync(filepath)) {
            throw new Error('Backup not found');
        }

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
            const restoreCmd = `mysql -h ${config.DB_HOST} -P ${config.DB_PORT} -u ${config.DB_USER} -p${config.DB_PASS} ${config.DB_NAME} < "${sqlFile}"`;
            await execAsync(restoreCmd);

            // Clean up decompressed file if it was compressed
            if (filename.endsWith('.gz') && fs.existsSync(sqlFile)) {
                fs.unlinkSync(sqlFile);
            }

            console.log(`[Backup] Restore completed from: ${filename}`);
        } catch (error: any) {
            console.error('[Backup] Restore failed:', error.message);
            throw new Error(`Restore failed: ${error.message}`);
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
    private async logBackup(filename: string, size: number, description?: string): Promise<void> {
        try {
            // Log backup action to auditlog
            await db
                .insertInto('auditlog')
                .values({
                    userId: 0, // System action
                    type: 'reset_password' as any, // Closest type, backup is not in enum
                    data: JSON.stringify({ action: 'database_backup', filename, size, description }),
                    ip: null
                })
                .execute();
        } catch {
            // Table might not exist yet, just log to console
            console.log(`[Backup] Logged: ${filename}`);
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
     * Start automatic backup scheduler
     */
    startScheduler(): void {
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
