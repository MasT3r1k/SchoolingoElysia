import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { config } from '../../../../../src/config/app.config';

export const microsoftAuth = new Elysia()
    .group('/auth/microsoft', (app) => app
        .get('/connect', async ({ query }) => {
             if (!config.MICROSOFT_CLIENT_ID) return { error: 'Microsoft Auth not configured' };
             
             const scopes = [
                 'OnlineMeetings.ReadWrite',
                 'User.Read',
                 'offline_access'
             ];
             
             const redirectUri = 'http://localhost:3000/api/v1/auth/microsoft/callback';
             
             const url = `https://login.microsoftonline.com/${config.MICROSOFT_TENANT_ID || 'common'}/oauth2/v2.0/authorize?client_id=${config.MICROSOFT_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&response_mode=query&scope=${encodeURIComponent(scopes.join(' '))}&state=12345`;
             
             return { url };
        })
        .get('/callback', async ({ query, user }: any) => {
             const code = query.code;
             if (!code) return { error: 'No code provided' };
             
             const tokenUrl = `https://login.microsoftonline.com/${config.MICROSOFT_TENANT_ID || 'common'}/oauth2/v2.0/token`;
             const params = new URLSearchParams();
             params.append('client_id', config.MICROSOFT_CLIENT_ID!);
             params.append('scope', 'OnlineMeetings.ReadWrite User.Read offline_access');
             params.append('code', code);
             params.append('redirect_uri', 'http://localhost:3000/api/v1/auth/microsoft/callback');
             params.append('grant_type', 'authorization_code');
             params.append('client_secret', config.MICROSOFT_CLIENT_SECRET!);
             
             const response = await fetch(tokenUrl, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                 body: params
             });
             
             const tokens = await response.json();
             
             if (tokens.error) return { error: tokens.error_description || 'Failed to get tokens' };

             if (!user) return { error: 'User not authenticated' };
             
             await db.insertInto('oauth_tokens')
                .values({
                    userId: user.userId,
                    provider: 'microsoft',
                    access_token: tokens.access_token,
                    refresh_token: tokens.refresh_token,
                    expires_at: new Date(Date.now() + tokens.expires_in * 1000)
                })
                .execute();

             return { success: true, message: 'Microsoft account connected' };
        })
    );
