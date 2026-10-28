import { execSync, exec } from 'node:child_process';
import { changelog } from '../../data/changelog.data';

export class GitVersionService {
  localCommit = 'unknown';
  remoteCommit = 'unknown';

  private intervalId: NodeJS.Timeout | null = null;
  private isRefreshing = false;

  constructor() {
    this.init();
  }

  async init() {
    this.localCommit = this.loadLocalCommit();
    this.remoteCommit = await this.loadRemoteCommit();
    this.startInterval(5 * 60 * 1000);
  }

  loadLocalCommit(): string {
    try {
      return execSync('git rev-parse HEAD').toString().trim();
    } catch (err) {
      return 'unknown';
    }
  }

  loadRemoteCommit(): Promise<string> {
    return new Promise((resolve) => {
      exec('git fetch origin main --quiet', (err) => {
        if (err) return resolve('unknown');
        exec('git rev-parse origin/main', (err2, stdout) => {
          if (err2) return resolve('unknown');
          resolve(stdout.toString().trim());
        });
      });
    });
  }

  loadRemoteVersion(): Promise<string> {
    return new Promise((resolve) => {
      exec('git show origin/main:src/data/changelog.data.ts', (err, stdout) => {
        if (err) return resolve('unknown');
        const match = stdout.toString().match(/version:\s*['"]([\d\.]+)['"]/);
        if (match && match[1]) {
          resolve(match[1]);
        } else {
          resolve('unknown');
        }
      });
    });
  }

  async refreshRemote() {
    if (this.isRefreshing) return;
    this.isRefreshing = true;
    this.remoteCommit = await this.loadRemoteCommit();
    this.isRefreshing = false;
  }

  startInterval(ms: number) {
    if (this.intervalId) return;
    this.intervalId = setInterval(async () => {
      await this.refreshRemote();
    }, ms);
  }

  stopInterval() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = null;
  }

  async getAheadBehindCount(): Promise<{ ahead: number; behind: number }> {
    return new Promise((resolve) => {
      exec('git rev-list --left-right --count HEAD...origin/main', (err, stdout) => {
        if (err) return resolve({ ahead: 0, behind: 0 });
        const counts = stdout.toString().trim().split(/\s+/).map(Number);
        resolve({ ahead: counts[0] || 0, behind: counts[1] || 0 });
      });
    });
  }
}

export const gitService = new GitVersionService();
