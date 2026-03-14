import { wsClientManager } from './ws-client-manager';
import { db } from '../../database';
import webpush from 'web-push';
import { MainConfig } from '../config/main.config';

// Notification types
export type NotificationType = 
    | 'new_grade'
    | 'new_homework'
    | 'new_message'
    | 'new_absence'
    | 'new_login'
    | 'new_substitution'
    | 'new_reward'
    | 'announcement'
    | 'leave_reaction'
    | 'leave_request'
    | 'leave_balance_low';

export interface NotificationPayload {
    type: string;
    title?: string;
    body?: string;
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

        // 4. Store notification in database for notification center
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
     * Send a notification by type (Generic entry point)
     */
    async sendNotification(type: string, user_id: number, data: any): Promise<void> {
        let payload: NotificationPayload | null = null;

        switch (type) {
            case 'new_grade':
            case 'grade_new':
                payload = {
                    type,
                    data: data,
                    url: '/marks/interm',
                    icon: 'star'
                };
                break;
            case 'new_homework':
            case 'homework_new':
                payload = {
                    type,
                    data: data,
                    url: '/teach/homeworks',
                    icon: 'book-2'
                };
                break;
            case 'new_message':
            case 'message_new':
                payload = {
                    type,
                    data: data,
                    url: `/messages/received?id=${data.messageId}`,
                    icon: 'message'
                };
                break;
            case 'new_absence':
            case 'absence_new':
                payload = {
                    type,
                    data: data,
                    url: '/teach/absence',
                    icon: 'calendar-x'
                };
                break;
            case 'new_substitution':
            case 'substitution_new':
                payload = {
                    type,
                    data: data,
                    url: '/teach/timetable',
                    icon: 'calendar-event'
                };
                break;
            case 'new_reward':
            case 'reward_new':
                payload = {
                    type,
                    data: data,
                    url: '/teach/rewards',
                    icon: 'trophy'
                };
                break;
            case 'leave_reaction':
                payload = {
                    type,
                    data: data,
                    url: '/teach/leave',
                    icon: data.status === 'approved' ? 'check' : 'x'
                };
                break;
            case 'leave_request':
                payload = {
                    type,
                    data: data,
                    url: `/system/employees/vacations?id=${data.requestId}`,
                    icon: 'file-text'
                };
                break;
            case 'leave_balance_low':
                payload = {
                    type,
                    data: data,
                    url: '/teach/leave',
                    icon: 'alert-triangle'
                };
                break;
            case 'announcement':
                payload = {
                    type,
                    data: data,
                    url: data.url,
                    icon: 'bullhorn'
                };
                break;
            default:
                payload = {
                    type,
                    data: data
                }
        }

        if (payload) {
            await this.sendToUser(user_id, payload);
        }
    }

    /**
     * Send notification when a new grade is added
     */
    async notifyNewGrade(studentuser_id: number, data: {
        subject: string;
        grade: string;
        weight: number;
        topic?: string;
        teacherName: string;
    }): Promise<void> {
        await this.sendNotification('new_grade', studentuser_id, data);
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
        await Promise.all(studentUserIds.map(userId => this.sendNotification('new_homework', userId, data)));
    }

    /**
     * Send notification for new message
     */
    async notifyNewMessage(recipientuser_id: number, data: {
        senderName: string;
        subject: string;
        preview?: string;
        messageId: number;
    }): Promise<void> {
        await this.sendNotification('new_message', recipientuser_id, data);
    }

    /**
     * Send notification for absence
     */
    async notifyAbsence(studentuser_id: number, parentUserIds: number[], data: {
        date: Date;
        hours: number;
        type: 'unexcused' | 'excused' | 'late';
    }): Promise<void> {
        const enrichedData = { ...data, absenceType: data.type };
        await this.sendNotification('new_absence', studentuser_id, enrichedData);
        await Promise.all(parentUserIds.map(userId => this.sendNotification('new_absence', userId, enrichedData)));
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
        await Promise.all(userIds.map(userId => this.sendNotification('new_substitution', userId, data)));
    }

    /**
     * Send notification for new reward
     */
    async notifyNewReward(studentuser_id: number, data: {
        title: string;
        type: 'financial' | 'certificate' | 'prize' | 'other';
        amount?: number;
    }): Promise<void> {
        await this.sendNotification('new_reward', studentuser_id, data);
    }

    /**
     * Send notification for leave reaction (approval/rejection)
     */
    async notifyLeaveReaction(teacheruser_id: number, data: {
        status: 'approved' | 'rejected';
        startDate: Date;
        endDate: Date;
        approverName: string;
        comment?: string;
    }): Promise<void> {
        await this.sendNotification('leave_reaction', teacheruser_id, data);
    }

    /**
     * Send notification for new leave request to HR/Managers
     */
    async notifyNewLeaveRequest(recipientUserIds: number[], data: {
        employeeName: string;
        startDate: Date;
        endDate: Date;
        requestId: number;
    }): Promise<void> {
        await Promise.all(recipientUserIds.map(userId => this.sendNotification('leave_request', userId, data)));
    }

    /**
     * Send notification for low vacation balance
     */
    async notifyLowLeaveBalance(user_id: number, data: {
        balance: number;
        threshold: number;
    }): Promise<void> {
        await this.sendNotification('leave_balance_low', user_id, data);
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
