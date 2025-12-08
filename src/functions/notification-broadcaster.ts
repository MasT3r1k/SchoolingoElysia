/**
 * Notification Broadcaster
 * Sends real-time notifications to users via WebSocket and Web Push
 */

import { wsClientManager } from './ws-client-manager';
import { db } from '../../database';
import webpush from 'web-push';

// Notification types
export type NotificationType = 
    | 'grade_new'
    | 'homework_new'
    | 'message_new'
    | 'absence_new'
    | 'substitution_new'
    | 'reward_new'
    | 'schedule_change'
    | 'announcement';

export interface NotificationPayload {
    type: NotificationType;
    title: string;
    body: string;
    data?: Record<string, any>;
    url?: string;
    icon?: string;
}

// Configure web-push (you need to generate VAPID keys)
// Run: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@schoolingo.cz';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

class NotificationBroadcaster {
    /**
     * Send notification to a specific user
     */
    async sendToUser(userId: number, notification: NotificationPayload): Promise<void> {
        // 1. Send via WebSocket if user is online
        if (wsClientManager.isUserOnline(userId)) {
            wsClientManager.sendToUser(userId, {
                type: 'notification',
                payload: notification
            });
        }

        // 2. Check if user has notification rule enabled for this type
        const rule = await db
            .selectFrom('notification_rules')
            .select(['enabled'])
            .where('user_id', '=', userId)
            .where('type', '=', notification.type)
            .executeTakeFirst();

        if (!rule?.enabled) {
            return; // User has disabled this notification type
        }

        // 3. Send push notification if user has subscriptions and is offline
        if (!wsClientManager.isUserOnline(userId) && VAPID_PUBLIC_KEY) {
            await this.sendPushNotification(userId, notification);
        }

        // 4. Store notification in database for notification center
        await this.storeNotification(userId, notification);
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
     * Send notification when a new grade is added
     */
    async notifyNewGrade(studentUserId: number, data: {
        subject: string;
        grade: string;
        weight: number;
        topic?: string;
        teacherName: string;
    }): Promise<void> {
        await this.sendToUser(studentUserId, {
            type: 'grade_new',
            title: 'Nová známka',
            body: `${data.subject}: ${data.grade} (váha ${data.weight})${data.topic ? ` - ${data.topic}` : ''}`,
            data: data,
            url: '/marks/interm',
            icon: 'star'
        });
    }

    /**
     * Send notification when homework is assigned
     */
    async notifyNewHomework(studentUserIds: number[], data: {
        subject: string;
        title: string;
        dueDate: Date;
        teacherName: string;
    }): Promise<void> {
        const notification: NotificationPayload = {
            type: 'homework_new',
            title: 'Nový domácí úkol',
            body: `${data.subject}: ${data.title} (termín: ${data.dueDate.toLocaleDateString('cs-CZ')})`,
            data: data,
            url: '/teach/homeworks',
            icon: 'book-2'
        };
        await this.sendToUsers(studentUserIds, notification);
    }

    /**
     * Send notification for new message
     */
    async notifyNewMessage(recipientUserId: number, data: {
        senderName: string;
        subject: string;
        preview?: string;
        messageId: number;
    }): Promise<void> {
        await this.sendToUser(recipientUserId, {
            type: 'message_new',
            title: `Zpráva od ${data.senderName}`,
            body: data.subject,
            data: data,
            url: `/messages/received?id=${data.messageId}`,
            icon: 'message'
        });
    }

    /**
     * Send notification for absence
     */
    async notifyAbsence(studentUserId: number, parentUserIds: number[], data: {
        date: Date;
        hours: number;
        type: 'unexcused' | 'excused' | 'late';
    }): Promise<void> {
        const notification: NotificationPayload = {
            type: 'absence_new',
            title: 'Nová absence',
            body: `${data.date.toLocaleDateString('cs-CZ')}: ${data.hours} hodin (${data.type === 'unexcused' ? 'neomluveno' : data.type === 'excused' ? 'omluveno' : 'pozdní příchod'})`,
            data: data,
            url: '/teach/absence',
            icon: 'calendar-x'
        };
        
        await this.sendToUser(studentUserId, notification);
        await this.sendToUsers(parentUserIds, notification);
    }

    /**
     * Send notification for schedule change
     */
    async notifyScheduleChange(userIds: number[], data: {
        date: Date;
        originalSubject?: string;
        newSubject?: string;
        changeType: 'cancelled' | 'substitution' | 'room_change';
        description?: string;
    }): Promise<void> {
        let body = '';
        switch (data.changeType) {
            case 'cancelled':
                body = `${data.date.toLocaleDateString('cs-CZ')}: ${data.originalSubject} - hodina zrušena`;
                break;
            case 'substitution':
                body = `${data.date.toLocaleDateString('cs-CZ')}: ${data.originalSubject} → ${data.newSubject}`;
                break;
            case 'room_change':
                body = `${data.date.toLocaleDateString('cs-CZ')}: ${data.originalSubject} - ${data.description}`;
                break;
        }

        await this.sendToUsers(userIds, {
            type: 'schedule_change',
            title: 'Změna rozvrhu',
            body,
            data: data,
            url: '/teach/timetable',
            icon: 'calendar-event'
        });
    }

    /**
     * Send notification for new reward
     */
    async notifyNewReward(studentUserId: number, data: {
        title: string;
        type: 'financial' | 'certificate' | 'prize' | 'other';
        amount?: number;
    }): Promise<void> {
        await this.sendToUser(studentUserId, {
            type: 'reward_new',
            title: 'Nová odměna',
            body: data.amount ? `${data.title} - ${data.amount} Kč` : data.title,
            data: data,
            url: '/teach/rewards',
            icon: 'trophy'
        });
    }

    /**
     * Send push notification via Web Push API
     */
    private async sendPushNotification(userId: number, notification: NotificationPayload): Promise<void> {
        if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
            return; // Push notifications not configured
        }

        try {
            const subscriptions = await db
                .selectFrom('push_subscriptions')
                .selectAll()
                .where('user_id', '=', userId)
                .execute();

            const pushPayload = JSON.stringify({
                title: notification.title,
                body: notification.body,
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
     * Store notification in database
     */
    private async storeNotification(userId: number, notification: NotificationPayload): Promise<void> {
        try {
            await db
                .insertInto('notifications')
                .values({
                    user_id: userId,
                    type: notification.type,
                    data: JSON.stringify({
                        title: notification.title,
                        body: notification.body,
                        ...notification.data
                    }),
                    action: JSON.stringify({
                        url: notification.url
                    })
                    // read_at and created_at are auto-generated
                })
                .execute();
        } catch (err) {
            console.error('[Notification] Failed to store notification:', err);
        }
    }
}

export const notificationBroadcaster = new NotificationBroadcaster();
