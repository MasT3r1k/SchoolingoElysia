import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';
import moment from 'moment';

const app = new Elysia()
    .group('/online', (app) => app
        .get('/lessons', async ({ user }: any) => {
            if (!user) return { error: 'Unauthorized' };

            let query = db.selectFrom('online_lessons as ol')
                .leftJoin('users as u', 'u.userId', 'ol.teacher')
                .leftJoin('persons as p', 'p.personId', 'u.person')
                .leftJoin('subjects as s', 's.subjectId', 'ol.subject_id')
                .select((eb) => [
                    'ol.lessonId', 'ol.title', 'ol.description', 'ol.start', 'ol.end', 
                    'ol.platform', 'ol.link', 'ol.teacher', 'ol.target_type', 
                    'ol.target_id', 'ol.subject_id', 'ol.created_at',
                    'p.firstName', 'p.lastName',
                    sql<string>`JSON_OBJECT('name', s.name, 'shortcut', s.shortcut)`.as('subject')
                ])
                .where('ol.end', '>', new Date())
                .orderBy('ol.start', 'asc');

            if (user.role === 'student' || user.role === 'parent') {
                const studentId = user.person;
                const student = await db.selectFrom('students')
                    .where('personId', '=', studentId)
                    .select('class')
                    .executeTakeFirst();
                
                if (student) {
                    const groups = await db.selectFrom('student_groups')
                        .where('student', '=', studentId) // Assuming student column refers to personId
                        .select('groupId')
                        .execute();
                    
                    const groupIds = groups.map(g => g.groupId);

                    query = query.where((eb) => eb.or([
                        eb('ol.target_type', '=', 'class').and('ol.target_id', '=', student.class),
                        ...(groupIds.length > 0 ? [eb('ol.target_type', '=', 'group').and('ol.target_id', 'in', groupIds)] : []),
                        eb('ol.target_type', '=', 'student').and('ol.target_id', '=', studentId)
                    ]));
                } else {
                    return [];
                }
            } else if (user.role === 'teacher') {
                query = query.where('ol.teacher', '=', user.userId);
            }

            return await query.execute();
        })
        .post('/lessons', async ({ user, body }: any) => {
            if (!user || user.role !== 'teacher') return { error: 'Unauthorized' };
            const { title, description, start, end, platform, link, target_type, target_id, subject_id, school } = body;
            
            if (!title || !start || !end || !platform || !link || !target_type || !target_id) {
                return { error: 'Missing required fields' };
            }

            const result = await db.insertInto('online_lessons')
                .values({
                    title,
                    description,
                    start: new Date(start),
                    end: new Date(end),
                    platform,
                    link,
                    teacher: user.userId,
                    target_type,
                    target_id,
                    subject_id: subject_id || null,
                    school: user.school || school || 1,
                })
                .execute();
            
            return { success: true, id: Number(result[0].insertId) };
        })
        .post('/generate', async ({ user, body }: any) => {
            if (!user) return { error: 'Unauthorized' };
            const { platform, title, start, end } = body;
            
            if (!platform || !title || !start || !end) return { error: 'Missing fields' };

            const provider = platform === 'meet' ? 'google' : (platform === 'teams' ? 'microsoft' : null);
            if (!provider) return { error: 'Unsupported platform for generation' };

            const token = await db.selectFrom('oauth_tokens')
                .where('userId', '=', user.userId)
                .where('provider', '=', provider)
                .select(['access_token', 'refresh_token', 'expires_at'])
                .executeTakeFirst();

            if (!token) return { error: 'not_connected', provider };
            
            // Check expiry and refresh if needed (simplified: assume valid or user re-connects on fail)
            // In production, implement refresh logic here.
            
            let link = '';
            
            if (provider === 'google') {
                const event = {
                    summary: title,
                    start: { dateTime: new Date(start).toISOString() },
                    end: { dateTime: new Date(end).toISOString() },
                    conferenceData: {
                        createRequest: { requestId: Math.random().toString(36).substring(7) }
                    }
                };
                
                const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token.access_token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(event)
                });
                
                const data: any = await response.json();
                if (data.error) return { error: 'api_error', details: data.error };
                
                link = data.hangoutLink || data.conferenceData?.entryPoints?.[0]?.uri;
            } else if (provider === 'microsoft') {
                const event = {
                    startDateTime: new Date(start).toISOString(),
                    endDateTime: new Date(end).toISOString(),
                    subject: title
                };
                
                const response = await fetch('https://graph.microsoft.com/v1.0/me/onlineMeetings', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token.access_token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(event)
                });
                
                 const data: any = await response.json();
                 if (data.error) return { error: 'api_error', details: data.error };
                 
                 link = data.joinWebUrl;
            }

            return { link };
        })
        .delete('/lessons/:id', async ({ user, params }: any) => {
            if (!user || user.role !== 'teacher') return { error: 'Unauthorized' };
            
            await db.deleteFrom('online_lessons')
                .where('lessonId', '=', Number(params.id))
                .where('teacher', '=', user.userId)
                .execute();
            
            return { success: true };
        })
    );

export default app;
