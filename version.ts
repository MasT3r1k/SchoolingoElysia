import { Elysia } from "elysia";
import { execSync, exec } from "child_process";

// ----------------------------
// Git Version Service (cache)
// ----------------------------
class GitVersionService {
    localCommit: string = "unknown";
    remoteCommit: string = "unknown";

    private intervalId: NodeJS.Timeout | null = null;
    private isRefreshing = false;

    constructor() {
        this.init();
    }

    // Load commits on server start
    async init() {
        this.localCommit = this.loadLocalCommit();
        this.remoteCommit = await this.loadRemoteCommit();

        // Start periodic check every 5 minutes (safe)
        this.startInterval(5 * 60 * 1000);
    }

    loadLocalCommit(): string {
        try {
            return execSync("git rev-parse HEAD").toString().trim();
        } catch (err) {
            console.error("❌ Failed to read local commit:", err);
            return "unknown";
        }
    }

    loadRemoteCommit(): Promise<string> {
        return new Promise((resolve) => {
            exec("git fetch origin main --quiet", (err) => {
                if (err) {
                    console.error("❌ Failed to fetch remote:", err);
                    return resolve("unknown");
                }
                exec("git rev-parse origin/main", (err2, stdout) => {
                    if (err2) {
                        console.error("❌ Failed to read remote commit:", err2);
                        return resolve("unknown");
                    }
                    resolve(stdout.toString().trim());
                });
            });
        });
    }

    // Safe refresh (prevents running twice)
    async refreshRemote() {
        if (this.isRefreshing) return;

        this.isRefreshing = true;
        this.remoteCommit = await this.loadRemoteCommit();
        this.isRefreshing = false;
    }

    // Periodic update check
    startInterval(ms: number) {
        if (this.intervalId) return; // prevent duplicates

        this.intervalId = setInterval(async () => {
            await this.refreshRemote();

            if (this.localCommit !== this.remoteCommit) {
                console.log("⚠️  New update available:", this.remoteCommit);
            }
        }, ms);
    }

    stopInterval() {
        if (this.intervalId) clearInterval(this.intervalId);
        this.intervalId = null;
    }
}


// Create instance (cache is inside it)
export const gitService = new GitVersionService();

import { changelog } from "./src/data/changelog.data";

export const version = new Elysia({ prefix: "/api/v1" })
    .on('start', () => {
        gitService.refreshRemote();
    })
    .on('stop', () => {
        gitService.stopInterval();
    })
    .get("/version", () => ({
        version: changelog[0].version,
        current: gitService.localCommit,
        latest: gitService.remoteCommit,
        isUpToDate: gitService.localCommit === gitService.remoteCommit
    }))
    .post("/refresh", async () => {
        await gitService.refreshRemote();
        return {
            ok: true,
            latest: gitService.remoteCommit
        };
    });

