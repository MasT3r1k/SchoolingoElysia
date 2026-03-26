import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { config } from '../../../../../src/config/app.config';
import { sql } from 'kysely';

export default new Elysia()
    .group('/auth/google', (app) => app
        .get('/connect', async ({ query, cookie, set }) => {
            if (!config.GOOGLE_CLIENT_ID) return { error: 'Google Auth not configured' };
            
            const scopes = [
                'https://www.googleapis.com/auth/calendar.events',
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile'
            ];
            
            const redirectUri = `${config.CORS_ORIGIN}/api/v1/auth/google/callback`; // Adjust based on frontend/backend structure. 
            // Actually, if backend is on different port, callback should be backend URL.
            // Assuming config.CORS_ORIGIN is frontend, let's use a hardcoded or env var for redirect URI base if needed.
            // Better: use request.url origin if possible, but for OAuth it must be registered.
            // Let's assume it's localhost:3000/api/v1/auth/google/callback or similar.
            
            // Generate simple state
            const state = Math.random().toString(36).substring(7);
            
            // Store state in cookie or handle it securely. content for now: just redirect.
            
            const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent('http://localhost:3000/api/v1/auth/google/callback')}&response_type=code&scope=${encodeURIComponent(scopes.join(' '))}&access_type=offline&prompt=consent&state=${state}`;

            return { url };
        })
        .get('/callback', async ({ query, cookie, set, user }: any) => {
            const code = query.code;
            if (!code) return { error: 'No code provided' };
            
            // Exchange code for token
            const tokenUrl = 'https://oauth2.googleapis.com/token';
            const params = new URLSearchParams();
            params.append('client_id', config.GOOGLE_CLIENT_ID!);
            params.append('client_secret', config.GOOGLE_CLIENT_SECRET!);
            params.append('code', code);
            params.append('grant_type', 'authorization_code');
            params.append('redirect_uri', 'http://localhost:3000/api/v1/auth/google/callback');
            
            const response = await fetch(tokenUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params
            });
            
            const tokens = await response.json() as any;
             
            if (tokens.error) return { error: tokens.error_description || 'Failed to get tokens' };
            
            // Verify user (optional but good practice)
            // Save tokens to DB for the current user
            // We need to know WHO is connecting.
            // If the user started the flow from frontend, they have a session cookie.
            // Accessing user from context driven by cookie.
            
            if (!user) return { error: 'User not authenticated' };
            
            await db.insertInto('oauth_tokens')
                .values({
                    user_id: user.user_id,
                    provider: 'google',
                    access_token: tokens.access_token,
                    refresh_token: tokens.refresh_token,
                    expires_at: new Date(Date.now() + tokens.expires_in * 1000)
                })
                .execute();

            return { success: true, message: 'Google account connected' };
        })
    );
