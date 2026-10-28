import Elysia, { t } from "elysia";
import { db } from '@database';

const app = new Elysia()
  .get('/notifications', async ({ cookie, query }) => {
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.user_id', 'tokens.user_id')
      .select(['tokens.user_id', 'users.person_id'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth?.person_id) return { error: 'no_user', details: 'no_db' };

    const offset = parseInt(query.offset as string) || 0;
    const limit = parseInt(query.limit as string) || 15;

    const notifications = await db.selectFrom('notifications')
    .select([
        'notification_id',
        'notifications.type',
        'notifications.data',
        'notifications.url',
        'notifications.read_at',
        'notifications.created_at'
    ])
    .where('notifications.user_id', '=', auth.user_id)
    .orderBy('notifications.created_at', 'desc')
    .limit(limit)
    .offset(offset)
    .execute();
   
    return notifications;
  })
  .get('/notifications/config', async ({ cookie }) => {
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    // You could also check if user is logged in here if needed
    // But config could just depend on the school settings

    // Check canteen enabled status
    const canteenSetting = await db.selectFrom('canteen_settings')
        .select('value')
        .where('key', '=', 'canteen_enabled')
        .executeTakeFirst();
    const canteenEnabled = canteenSetting?.value === 'true';

    // Simple types
    let simpleTypes = [
        { 
            id: 'grade_new', 
            name: 'Nová známka',
            icon: 'star',
            color: '#ffc107',
            description: 'Upozornění při přidání nové známky',
            hasConditions: false,
            conditionFields: [],
            roles: ['student', 'parent']
        },
        { 
            id: 'homework_new', 
            name: 'Nový domácí úkol',
            icon: 'book-2',
            color: '#7cd67c',
            description: 'Upozornění při zadání nového úkolu',
            hasConditions: false,
            conditionFields: [],
            roles: ['student', 'parent']
        },
        { 
            id: 'message_new', 
            name: 'Nová zpráva',
            icon: 'message',
            color: '#4aa3ff',
            description: 'Upozornění při přijetí nové zprávy',
            hasConditions: false,
            conditionFields: [],
            roles: ['all']
        },
        { 
            id: 'absence_new', 
            name: 'Nová absence',
            icon: 'calendar-x',
            color: '#ff9800',
            description: 'Upozornění při zapsání absence',
            hasConditions: false,
            conditionFields: [],
            roles: ['student', 'parent']
        },
        { 
            id: 'substitution_new', 
            name: 'Nová suplující hodina',
            icon: 'refresh',
            color: '#9c27b0',
            description: 'Upozornění při změně rozvrhu',
            hasConditions: false,
            conditionFields: [],
            roles: ['all']
        },
        { 
            id: 'reward_new', 
            name: 'Nová odměna',
            icon: 'trophy',
            color: '#f5d142',
            description: 'Upozornění při obdržení nové odměny',
            hasConditions: false,
            conditionFields: [],
            roles: ['student', 'parent']
        },
        { 
            id: 'leave_reaction', 
            name: 'Reakce na dovolenou',
            icon: 'circle-check',
            color: '#2196f3',
            description: 'Upozornění na schválení či zamítnutí dovolené',
            hasConditions: false,
            conditionFields: [],
            roles: ['teacher']
        },
        { 
            id: 'leave_request', 
            name: 'Nová žádost o dovolenou',
            icon: 'file-plus',
            color: '#ff5722',
            description: 'Upozornění na novou žádost o dovolenou od zaměstnance',
            hasConditions: false,
            conditionFields: [],
            roles: ['manager:all', 'management', 'personnel']
        }
    ];

    if (canteenEnabled) {
        simpleTypes.push({ 
            id: 'canteen_balance_negative', 
            name: 'Záporný zůstatek v jídelně',
            icon: 'wallet',
            color: '#ef4444',
            description: 'Upozornění při poklesu kreditu v jídelně do mínusu',
            hasConditions: false,
            conditionFields: [],
            roles: ['all']
        });
    }

    let advancedTypes = [
        { 
            id: 'advanced_grade_average_above', 
            name: 'Průměr vyšší než',
            icon: 'trending-up',
            color: '#4caf50',
            hasConditions: true,
            conditionFields: [
                { key: 'value', label: 'Hodnota', type: 'number', default: 3, min: 1, max: 5 }
            ],
            roles: ['student', 'parent']
        },
        { 
            id: 'advanced_grade_average_below', 
            name: 'Průměr nižší než',
            icon: 'trending-down',
            color: '#ff5757',
            hasConditions: true,
            conditionFields: [
                { key: 'value', label: 'Hodnota', type: 'number', default: 2, min: 1, max: 5 }
            ],
            roles: ['student', 'parent']
        },
        { 
            id: 'advanced_absence_count_above', 
            name: 'Absence vyšší než',
            icon: 'alert-circle',
            color: '#ff5757',
            hasConditions: true,
            conditionFields: [
                { key: 'hours', label: 'Počet hodin', type: 'number', default: 10, min: 1 },
                { key: 'percent', label: 'Absence v %', type: 'number', default: 30, min: 1, max: 100 },
                { key: 'subject', label: 'Předmět', type: 'select', default: 'all', options: [
                    { value: 'all', label: 'Všechny předměty' }
                ]}
            ],
            roles: ['student', 'parent']
        },
        { 
            id: 'advanced_homework_deadline_soon', 
            name: 'Blížící se termín úkolu',
            icon: 'clock-exclamation',
            color: '#ff9800',
            hasConditions: true,
            conditionFields: [
                { key: 'days', label: 'Dny před termínem', type: 'number', default: 1, min: 1, max: 7 }
            ],
            roles: ['student', 'parent']
        },
        { 
            id: 'advanced_leave_balance_low', 
            name: 'Nízký zůstatek dovolené',
            icon: 'battery-1',
            color: '#f44336',
            hasConditions: true,
            conditionFields: [
                { key: 'days', label: 'Zůstatek klesne pod (dny)', type: 'number', default: 5, min: 0 }
            ],
            roles: ['teacher', 'manager:all', 'management', 'personnel']
        }
    ];

    return { simpleTypes, advancedTypes };
  })

export default app;
