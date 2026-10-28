import nodemailer, { type Transporter, type SendMailOptions } from 'nodemailer';
import crypto from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { env } from '../config/env.config';

export type MailAddress = string | { name?: string; address: string };

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
  attachments?: SendMailOptions['attachments'];
  priority?: 'low' | 'normal' | 'high';
  headers?: Record<string, string>;
}

export class MailerModule {
  private transporter: Transporter | null = null;
  private config!: MailConfig;
  private initialized = false;
  private templateCache = new Map<string, string>();

  init(config?: Partial<MailConfig>) {
    if (this.initialized) return;

    this.config = {
      enabled: env.STMP_ENABLED,
      host: env.STMP_HOST,
      port: env.STMP_PORT,
      secure: env.STMP_PORT === 465,
      user: env.STMP_USER,
      pass: env.STMP_PASS,
      fromName: env.STMP_NAME,
      fromEmail: env.STMP_EMAIL || env.STMP_USER,
      debug: env.NODE_ENV === 'development',
      ...config,
    };

    if (!this.config.enabled || !this.config.host) {
      this.initialized = true;
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure,
      auth: {
        user: this.config.user,
        pass: this.config.pass,
      },
    });

    this.initialized = true;
    console.log('[✉️ Mailer]: SMTP service initialized');
  }

  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) return false;
    try {
      await this.transporter.verify();
      return true;
    } catch {
      return false;
    }
  }

  private async loadHtmlTemplate(
    templateName: string,
    data?: Record<string, string | number>
  ): Promise<string> {
    const templatePath = path.join(process.cwd(), 'emails', templateName);

    let html = this.templateCache.get(templatePath);
    if (!html) {
      html = await readFile(templatePath, 'utf-8');
      this.templateCache.set(templatePath, html);
    }

    if (data) {
      html = this.renderTemplate(html, data);
    }

    return html;
  }

  async sendFromTemplate(
    template: string,
    payload: Omit<SendMailPayload, 'html'> & {
      data?: Record<string, string | number>;
    }
  ) {
    const html = await this.loadHtmlTemplate(template, payload.data);
    return this.send({ ...payload, html });
  }

  async sendHtmlEmail(to: MailAddress | MailAddress[], subject: string, html: string): Promise<{ id: string }> {
    return this.send({ to, subject, html });
  }

  async send(payload: SendMailPayload): Promise<{ id: string }> {
    if (!this.initialized) {
      this.init();
    }

    if (!this.config?.enabled || !this.transporter) {
      return { id: 'disabled-mailer' };
    }

    const messageId = crypto.randomUUID();

    await this.transporter.sendMail({
      from: {
        name: this.config.fromName ?? 'Schoolingo',
        address: this.config.fromEmail ?? this.config.user,
      },
      to: payload.to as any,
      subject: payload.subject ?? '',
      text: payload.text,
      html: payload.html,
      priority: payload.priority,
      headers: payload.headers,
      messageId,
    });

    return { id: messageId };
  }

  renderTemplate(template: string, data: Record<string, string | number>) {
    return template.replace(/\{\{(.*?)\}\}/g, (_, key) => {
      return String(data[key.trim()] ?? '');
    });
  }
}

export const Mailer = new MailerModule();
