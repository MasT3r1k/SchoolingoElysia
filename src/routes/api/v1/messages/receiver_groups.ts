import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';

const app = new Elysia()
    .get('/messages/receiver_groups', async ({ cookie }) => {
        const token = cookie.token?.value as string;
        if (!token) return { error: 'no_user', details: 'no_cookie' };

        const auth = await db
            .selectFrom('tokens')
            .leftJoin('users', 'users.user_id', 'tokens.user_id')
            .select(['users.person_id'])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth?.person_id) return { error: 'no_user', details: 'no_db' };

        const groups = await db.selectFrom('message_recipient_groups')
            .selectAll()
            .where('author_id', '=', auth.person_id)
            .execute();

        const result = [];
        for (const group of groups) {
            const members = await db.selectFrom('message_recipient_group_members')
                .select('person_id')
                .where('group_id', '=', group.group_id)
                .execute();
            result.push({
                id: group.group_id,
                name: group.name,
                members: members.map(m => m.person_id).filter(id => id !== auth.person_id)
            });
        }
        return result;
    })
    .post('/messages/receiver_groups', async ({ cookie, body }) => {
        const token = cookie.token?.value as string;
        if (!token) return { error: 'no_user' };

        const auth = await db
            .selectFrom('tokens')
            .leftJoin('users', 'users.user_id', 'tokens.user_id')
            .select(['users.person_id'])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth?.person_id) return { error: 'no_user' };

        const { name, members } = body;
        if (!name || !members || !Array.isArray(members)) return { error: 'invalid_body' };

        // Check if group with same name already exists for this user
        const existingGroup = await db.selectFrom('message_recipient_groups')
            .select('group_id')
            .where('name', '=', name.trim())
            .where('author_id', '=', auth.person_id)
            .executeTakeFirst();

        if (existingGroup) {
            return { error: 'duplicate_name', details: 'Group with this name already exists' };
        }

        const groupResult = await db.insertInto('message_recipient_groups')
            .values({
                name: name.trim(),
                author_id: auth.person_id,
                created_at: new Date()
            })
            .executeTakeFirst();

        const groupId = Number(groupResult.insertId);

        if (members.length > 0) {
            await db.insertInto('message_recipient_group_members')
                .values(members.map(personId => ({
                    group_id: groupId,
                    person_id: personId
                })))
                .execute();
        }

        return { success: true, group_id: groupId };
    }, {
        body: t.Object({
            name: t.String(),
            members: t.Array(t.Number())
        })
    })
    .delete('/messages/receiver_groups/:id', async ({ cookie, params }) => {
        const token = cookie.token?.value as string;
        if (!token) return { error: 'no_user' };

        const auth = await db
            .selectFrom('tokens')
            .leftJoin('users', 'users.user_id', 'tokens.user_id')
            .select(['users.person_id'])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth?.person_id) return { error: 'no_user' };

        const groupId = parseInt(params.id);

        // Verify ownership
        const group = await db.selectFrom('message_recipient_groups')
            .select('group_id')
            .where('group_id', '=', groupId)
            .where('author_id', '=', auth.person_id)
            .executeTakeFirst();

        if (!group) return { error: 'not_found' };

        await db.deleteFrom('message_recipient_group_members').where('group_id', '=', groupId).execute();
        await db.deleteFrom('message_recipient_groups').where('group_id', '=', groupId).execute();

        return { success: true };
    }, {
        params: t.Object({
            id: t.String()
        })
    });

export default app;
