import Elysia, { t } from "elysia";
import { db } from "../../../../../database";
import moment from "moment";
import { createResponse } from "../../../../utils/response.helper";

const app = new Elysia()
  .post('/notification/:notification_id', async ({ cookie, params }) => {
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.userId', 'tokens.userId')
      .select(['tokens.userId', 'users.person'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth?.person) return { error: 'no_user', details: 'no_db' };

    if (!params.notification_id || isNaN(parseInt(params.notification_id))) {
        return { error: 'invalid_notification_id' };
    }

    const notification_id = parseInt(params.notification_id);

    let updateNotificationQuery = db.updateTable('notifications')
    .set({
        read_at: moment().toDate()
    })
    .where('notifications.read_at', 'is', null)
    .where('user_id', '=', auth.userId);
    if (notification_id != -1) {
        updateNotificationQuery = updateNotificationQuery.where('notification_id', '=', notification_id)
    }
    
    const updateNofication = await updateNotificationQuery.executeTakeFirst();
   
    return createResponse({ success: true }, cookie);

  });

export default app;
