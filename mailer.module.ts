import nodemailer, { Transporter, SendMailOptions } from "nodemailer";
import crypto from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

/* =========================
   TYPES
========================= */

export type MailAddress = string | {
    name?: string;
    address: string;
};

export interface MailConfig {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;

    fromName?: string;
    fromEmail?: string;

    enabled?: boolean;
    debug?: boolean;
}

export interface SendMailPayload {
    to: MailAddress | MailAddress[];
    subject: string;
    text?: string;
    html?: string;
    attachments?: SendMailOptions["attachments"];

    priority?: "low" | "normal" | "high";
    headers?: Record<string, string>;
}

/* =========================
   INTERNAL TYPES
========================= */

interface MailLog {
    id: string;
    to: string[];
    subject: string;
    success: boolean;
    error?: string;
    timestamp: Date;
}

/* =========================
   MAILER MODULE
========================= */

class MailerModule {
    private transporter: Transporter | null = null;
    private config!: MailConfig;
    private initialized = false;

    private logs: MailLog[] = [];

    /* =========================
       INIT
    ========================= */

    init(config: MailConfig) {
        if (this.initialized) return;

        this.config = {
            enabled: true,
            debug: false,
            ...config
        };

        if (!this.config.enabled) {
            this.initialized = true;
            return;
        }

        this.transporter = nodemailer.createTransport({
            host: this.config.host,
            port: this.config.port,
            secure: this.config.secure,
            auth: {
                user: this.config.user,
                pass: this.config.pass
            }
        });

        this.initialized = true;
    }

    /* =========================
       HEALTH CHECK
    ========================= */

    async verifyConnection(): Promise<boolean> {
        if (!this.transporter) return false;
        try {
            await this.transporter.verify();
            return true;
        } catch {
            return false;
        }
    }

    /* =========================
    TEMPLATE CACHE
    ========================= */

    private templateCache = new Map<string, string>();

    private async loadHtmlTemplate(
        templateName: string,
        data?: Record<string, string | number>
    ): Promise<string> {
        const templatePath = path.join(
            process.cwd(),
            "emails",
            templateName
        );

        let html = this.templateCache.get(templatePath);

        if (!html) {
            html = await readFile(templatePath, "utf-8");
            this.templateCache.set(templatePath, html);
        }

        if (data) {
            html = this.renderTemplate(html, data);
        }

        return html;
    }

    /* =========================
       SEND MAIL
    ========================= */

    async sendFromTemplate(
        template: string,
        payload: Omit<SendMailPayload, "html"> & {
            data?: Record<string, string | number>;
        }
    ) {
        const html = await this.loadHtmlTemplate(template, payload.data);

        return this.send({
            ...payload,
            html
        });
    }

    async send(payload: SendMailPayload): Promise<{ id: string }> {
        if (!payload) {
            throw new Error("Mailer.send called with undefined payload");
        }

        if (!this.initialized) {
            throw new Error("MailerModule not initialized");
        }

        if (!this.config.enabled) {
            return { id: "disabled-mailer" };
        }

        if (!this.transporter) {
            throw new Error("Mailer transporter missing");
        }

        if (!payload.to) {
            throw new Error("Recipient is required");
        }

        const messageId = crypto.randomUUID();
        console.log(payload)

        try {
            await this.transporter.sendMail({
                from: {
                    name: this.config.fromName ?? "System",
                    address: this.config.fromEmail ?? this.config.user
                },
                attachments: [],
                to: payload.to as any,
                subject: payload.subject ?? '',
                text: payload.text,
                html: payload.html,
                priority: payload.priority,
                headers: payload.headers,
                messageId
            } as SendMailOptions);

            this.log({
                id: messageId,
                to: this.normalizeAddresses(payload.to),
                subject: payload.subject,
                success: true,
                timestamp: new Date()
            });

            return { id: messageId };

        } catch (err: any) {
            this.log({
                id: messageId,
                to: this.normalizeAddresses(payload.to),
                subject: payload.subject,
                success: false,
                error: err?.message ?? "Unknown error",
                timestamp: new Date()
            });

            throw err;
        }
    }

    /* =========================
       SIMPLE TEMPLATE
    ========================= */

    renderTemplate(template: string, data: Record<string, string | number>) {
        return template.replace(/\{\{(.*?)\}\}/g, (_, key) => {
            return String(data[key.trim()] ?? "");
        });
    }

    /* =========================
       LOGS
    ========================= */

    private log(entry: MailLog) {
        this.logs.push(entry);

        if (this.config.debug) {
            console.log("[MAILER]", entry);
        }
    }

    getLogs(limit = 50) {
        return this.logs.slice(-limit);
    }

    /* =========================
       HELPERS
    ========================= */

    private normalizeAddresses(addr: MailAddress | MailAddress[]): string[] {
        const list = Array.isArray(addr) ? addr : [addr];
        return list.map(a => typeof a === "string" ? a : a.address);
    }
}

/* =========================
   EXPORT SINGLETON
========================= */

export const Mailer = new MailerModule();
