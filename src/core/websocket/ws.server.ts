import { Elysia, t } from 'elysia';
import { db } from '../database/connection';
import { wsClientManager } from '../../functions/ws-client-manager';
import { QRConfig } from '../../config/qr.config';
import { generateSecureQRCode } from './ws-qr.service';

const TOKEN_REVALIDATE_MS = 10_000;

export interface WsState {
  role: 'user' | 'guest';
  user: {
    user_id: number;
    person: number | null;
  } | null;
  auth: {
    token: string;
    tokenId: number;
    expires: number;
    lastValidated: number;
  } | null;
}

export const wsStateStore = new Map<string, WsState>();

async function revalidateWsState(ws: any): Promise<WsState> {
  const wsId = ws.id;
  const token = ws.data.cookie?.token?.value as string | undefined;
  const now = Date.now();

  const prev =
    wsStateStore.get(wsId) ??
    ({
      role: 'guest',
      user: null,
      auth: null,
    } satisfies WsState);

  if (!token) {
    if (prev.role === 'user') {
      wsClientManager.unregister(wsId);
      ws.send(JSON.stringify({ type: 'session_lost' }));
    }
    const state: WsState = { role: 'guest', user: null, auth: null };
    wsStateStore.set(wsId, state);
    return state;
  }

  if (
    prev.auth &&
    prev.auth.token === token &&
    now - prev.auth.lastValidated < TOKEN_REVALIDATE_MS &&
    now < prev.auth.expires
  ) {
    return prev;
  }

  const auth = await db
    .selectFrom('tokens')
    .leftJoin('users', 'users.user_id', 'tokens.user_id')
    .select(['tokens.token_id', 'tokens.expires', 'tokens.user_id', 'users.person_id'])
    .where('tokens.token', '=', token)
    .where('tokens.expires', '>=', new Date())
    .executeTakeFirst();

  if (!auth) {
    if (prev.role === 'user') {
      wsClientManager.unregister(wsId);
      ws.send(JSON.stringify({ type: 'session_expired' }));
    }
    const state: WsState = { role: 'guest', user: null, auth: null };
    wsStateStore.set(wsId, state);
    return state;
  }

  const state: WsState = {
    role: 'user',
    user: {
      user_id: auth.user_id,
      person: auth.person_id,
    },
    auth: {
      token,
      tokenId: auth.token_id,
      expires: +new Date(auth.expires),
      lastValidated: now,
    },
  };

  if (prev.role !== 'user' || prev.user?.user_id !== auth.user_id) {
    wsClientManager.register(wsId, ws, auth.user_id, auth.person_id);
    ws.send(
      JSON.stringify({
        type: 'authenticated',
        user_id: auth.user_id,
      })
    );
  }

  wsStateStore.set(wsId, state);
  return state;
}

export const wsRouter = new Elysia().ws('/ws', {
  cookie: t.Object({
    token: t.Optional(t.String()),
  }),

  async open(ws) {
    wsStateStore.set(ws.id, {
      role: 'guest',
      user: null,
      auth: null,
    });
    console.log(`[WS]: Client connected ${ws.id}`);
  },

  async message(ws, raw: any) {
    const state = await revalidateWsState(ws);
    const msg = raw;

    if (state.role === 'guest') {
      if (msg.type === 'qrcode_request') {
        const { qrcode, fullCode } = generateSecureQRCode();

        await db
          .insertInto('login_qrcodes')
          .values({
            qrcode,
            socket: ws.id,
            user_agent: ws.data.headers?.['user-agent']?.toString() ?? 'unknown',
            ip: ws.remoteAddress,
          })
          .execute();

        ws.send(
          JSON.stringify({
            type: 'qrcode_result',
            payload: fullCode,
            expiresIn: QRConfig.QR_EXPIRY_MS,
          })
        );
        return;
      }

      if (msg.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', ts: Date.now() }));
        return;
      }

      return;
    }

    if (msg.type === 'echo') {
      ws.send({
        type: 'echo',
        msg: msg.data,
        user_id: state.user!.user_id,
      });
      return;
    }

    if (msg.type === 'notification_read') {
      await db
        .updateTable('notifications')
        .set({ read_at: new Date() })
        .where('notification_id', '=', msg.notificationId)
        .where('user_id', '=', state.user!.user_id)
        .execute();

      ws.send({
        type: 'notification_read_ack',
        notificationId: msg.notificationId,
      });
      return;
    }

    if (msg.type === 'get_unread_count') {
      const r = await db
        .selectFrom('notifications')
        .select(db.fn.count('notification_id').as('count'))
        .where('user_id', '=', state.user!.user_id)
        .where('read_at', 'is', null)
        .executeTakeFirst();

      ws.send({
        type: 'unread_count',
        count: Number(r?.count ?? 0),
      });
      return;
    }

    ws.send({ error: 'unknown_request' });
  },

  async close(ws) {
    const state = wsStateStore.get(ws.id);
    if (state?.role === 'user') {
      wsClientManager.unregister(ws.id);
    }

    await db.deleteFrom('login_qrcodes').where('socket', '=', ws.id).execute();
    wsStateStore.delete(ws.id);
    console.log(`[WS]: Client disconnected ${ws.id}`);
  },
});
