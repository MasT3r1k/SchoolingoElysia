import { wsClientManager } from './ws-client-manager';
import { db } from '@database';
import webpush from 'web-push';
import { MainConfig } from '../config/main.config';

import moment from 'moment';
import { Mailer } from '@core/mailer/mailer.service';

// Notification types
export type NotificationType = 
    | 'new_grade'
    | 'grade_new'
    | 'new_homework'
    | 'homework_new'
    | 'new_message'
    | 'message_new'
    | 'new_absence'
    | 'absence_new'
    | 'new_login'
    | 'new_substitution'
    | 'substitution_new'
    | 'new_reward'
    | 'reward_new'
    | 'announcement'
    | 'leave_reaction'
    | 'leave_request'
    | 'leave_balance_low'
    | 'canteen_meal_changed'
    | 'canteen_balance_negative';

export interface NotificationPayload {
    type: string;
    title?: string;
    body?: string;
    data?: Record<string, any>;
    url?: string;
    icon?: string;
    email?: {
        template?: string;
        subject: string;
        text?: string;
        data?: Record<string, string | number>;
    };
}

// Configure web-push (you need to generate VAPID keys)
// Run: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@schoolingo.cz';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

class NotificationService {
    /**
     * Send notification to a specific user
     */
    async sendToUser(user_id: number, notification: NotificationPayload): Promise<void> {
        // 1. Send via WebSocket if user is online
        if (wsClientManager.isUserOnline(user_id)) {
            wsClientManager.sendToUser(user_id, {
                type: 'notification',
                payload: notification
            });
        }

        // 2. Check if user has notification rule enabled for this type
        const rule = await db
            .selectFrom('notification_rules')
            .select(['enabled'])
            .where('user_id', '=', user_id)
            .where('type', '=', notification.type)
            .executeTakeFirst();

        const isEnabledByDefault = MainConfig.DEFAULT_NOTIFICATION.includes(notification.type as any);
        
        if (rule) {
            if (!rule.enabled) return; // User explicitly disabled
        } else if (!isEnabledByDefault) {
            return; // Not enabled by default and no rule
        }

        // 3. Send push notification if user has subscriptions and is offline
        if (!wsClientManager.isUserOnline(user_id) && VAPID_PUBLIC_KEY) {
            await this.sendPushNotification(user_id, notification);
        }

        // 4. Send email notification if specified
        if (notification.email) {
            await this.sendEmailNotification(user_id, notification.email);
        }

        // 5. Store notification in database for notification center
        await this.storeNotification(user_id, notification);
    }

    /**
     * Send notification to multiple users
     */
    async sendToUsers(userIds: number[], notification: NotificationPayload): Promise<void> {
        await Promise.all(userIds.map(userId => this.sendToUser(userId, notification)));
    }

    /**
     * Broadcast to all users (use sparingly)
     */
    async broadcast(notification: NotificationPayload): Promise<void> {
        wsClientManager.broadcast({
            type: 'notification',
            payload: notification
        });
    }

    /**
     * Unified notification sender
     */
    async sendNotification(type: NotificationType, target: number | number[], data?: any): Promise<void> {
        return this.notify(type, target, data);
    }

    async notify(type: NotificationType, target: number | number[], data?: any): Promise<void> {
        const userIds = Array.isArray(target) ? target : [target];
        if (userIds.length === 0) return;

        let payload: NotificationPayload | null = null;

        switch (type) {
            case 'new_grade':
            case 'grade_new':
                payload = { type, data, url: '/marks/interm', icon: 'star' };
                break;
            case 'new_homework':
            case 'homework_new':
                payload = { type, data, url: '/teach/homeworks', icon: 'book-2' };
                break;
            case 'new_message':
            case 'message_new':
                payload = { type, data, url: `/messages/received?id=${data?.messageId}`, icon: 'message' };
                break;
            case 'new_absence':
            case 'absence_new':
                payload = { type, data, url: '/teach/absence', icon: 'calendar-x' };
                break;
            case 'new_substitution':
            case 'substitution_new':
                payload = { type, data, url: '/teach/timetable', icon: 'calendar-event' };
                break;
            case 'new_reward':
            case 'reward_new':
                payload = { type, data, url: '/teach/rewards', icon: 'trophy' };
                break;
            case 'leave_reaction':
                payload = { type, data, url: '/teach/leave', icon: data?.status === 'approved' ? 'check' : 'x' };
                break;
            case 'leave_request':
                payload = { type, data, url: `/system/employees/vacations?id=${data?.requestId}`, icon: 'file-text' };
                break;
            case 'leave_balance_low':
                payload = { type, data, url: '/teach/leave', icon: 'alert-triangle' };
                break;
            case 'announcement':
                payload = { type, data, url: data?.url, icon: 'bullhorn' };
                break;
            case 'new_login':
                payload = {
                    type,
                    title: 'Nové přihlášení',
                    body: `Nové přihlášení z neznámého zařízení: ${data?.city ? data.city + ', ' : ''}${data?.country || 'Neznámé místo'}`,
                    data: {
                        id: data?.id,
                        city: data?.city,
                        ip: data?.ip,
                        country: data?.country,
                        country_code: data?.country_code
                    },
                    icon: 'shield',
                    email: {
                        template: 'new_login.html',
                        subject: 'Nové přihlášení z neznámého zařízení',
                        data: {
                            location: `${data?.city || 'Neznámé místo'}, ${data?.country || ''}`,
                            security_url: "https://localhost:4200", // TODO: Config
                            device: data?.device,
                            ip: data?.ip,
                            time: data?.time
                        }
                    }
                };
                break;
            case 'canteen_meal_changed':
                payload = {
                    type,
                    title: 'Změna jídla',
                    body: `Vaše jídlo na den ${data?.dateFormatted} bylo změněno na: ${data?.newMealName}`,
                    data: {
                        date: data?.date,
                        newMealName: data?.newMealName
                    },
                    icon: 'soup',
                    url: '/canteen/meals',
                    email: {
                        subject: 'Změna jídla ve školní jídelně',
                        text: `Dobrý den,\nVaše jídlo na den ${data?.dateFormatted} bylo změněno na: ${data?.newMealName}.\n\nDěkujeme,\nSchoolingo`
                    }
                };
                break;
            default:
                payload = { type, data };
        }

        if (payload) {
            await Promise.all(userIds.map(userId => this.sendToUser(userId, payload!)));
        }
    }

    /**
     * Send push notification via Web Push API
     */
    private async sendPushNotification(user_id: number, notification: NotificationPayload): Promise<void> {
        if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
            return; // Push notifications not configured
        }

        try {
            const subscriptions = await db
                .selectFrom('push_subscriptions')
                .selectAll()
                .where('user_id', '=', user_id)
                .execute();

            const pushPayload = JSON.stringify({
                title: notification.title || notification.type,
                body: notification.body || '',
                icon: notification.icon || '/assets/logo/logo-48.png',
                badge: '/assets/logo/logo-48.png',
                url: notification.url,
                data: notification.data
            });

            for (const sub of subscriptions) {
                try {
                    await webpush.sendNotification({
                        endpoint: sub.endpoint,
                        keys: {
                            p256dh: sub.p256dh,
                            auth: sub.auth
                        }
                    }, pushPayload);
                } catch (err: any) {
                    // If subscription is invalid, remove it
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        await db
                            .deleteFrom('push_subscriptions')
                            .where('subscription_id', '=', sub.subscription_id)
                            .execute();
                    }
                    console.error(`[Push] Failed to send to subscription ${sub.subscription_id}:`, err);
                }
            }
        } catch (err) {
            console.error('[Push] Failed to send push notification:', err);
        }
    }

    /**
     * Send email notification
     */
    private async sendEmailNotification(user_id: number, emailPayload: NonNullable<NotificationPayload['email']>): Promise<void> {
        try {
            const user = await db
                .selectFrom('users')
                .select('person_id')
                .where('user_id', '=', user_id)
                .executeTakeFirst();
            
            if (!user?.person_id) return;

            const emails = await db
                .selectFrom('emails')
                .select('email')
                .where('person_id', '=', user.person_id)
                .where('is_verified', '=', true)
                .execute();

            for (const record of emails) {
                if (emailPayload.template) {
                    await Mailer.sendFromTemplate(emailPayload.template, {
                        to: record.email,
                        subject: emailPayload.subject,
                        data: emailPayload.data
                    });
                } else if (emailPayload.text) {
                    await Mailer.send({
                        to: record.email,
                        subject: emailPayload.subject,
                        text: emailPayload.text
                    });
                }
            }
        } catch (err) {
            console.error('[Email] Failed to send email notification:', err);
        }
    }

    /**
     * Store notification in database
     */
    private async storeNotification(user_id: number, notification: NotificationPayload): Promise<void> {
        try {
            await db
                .insertInto('notifications')
                .values({
                    user_id,
                    type: notification.type,
                    data: JSON.stringify({
                        ...notification.data,
                        title: notification.title,
                        body: notification.body
                    })
                    // read_at and created_at are auto-generated
                })
                .execute();
        } catch (err) {
            console.error('[Notification] Failed to store notification:', err);
        }
    }
}

export const notificationService = new NotificationService();
