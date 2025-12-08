/**
 * CSRF Protection Middleware
 * Implements CSRF token validation for state-changing requests
 */
import { Elysia } from 'elysia';
import { createHmac, randomBytes } from 'crypto';

const CSRF_SECRET = process.env.CSRF_SECRET || 'schoolingo-csrf-secret-change-in-production';
const CSRF_TOKEN_EXPIRY_MS = 3600000; // 1 hour

/**
 * Generate CSRF token
 */
export function generateCSRFToken(sessionId: string): string {
    const timestamp = Date.now();
    const randomPart = randomBytes(16).toString('hex');
    const payload = `${sessionId}|${timestamp}|${randomPart}`;
    const signature = createHmac('sha256', CSRF_SECRET)
        .update(payload)
        .digest('hex')
        .substring(0, 32);
    
    return Buffer.from(`${payload}|${signature}`).toString('base64');
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string, sessionId: string): boolean {
    try {
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        const parts = decoded.split('|');
        
        if (parts.length !== 4) {
            return false;
        }

        const [tokenSessionId, timestampStr, randomPart, signature] = parts;
        const timestamp = parseInt(timestampStr, 10);

        // Check session match
        if (tokenSessionId !== sessionId) {
            return false;
        }

        // Check expiry
        if (Date.now() - timestamp > CSRF_TOKEN_EXPIRY_MS) {
            return false;
        }

        // Verify signature
        const payload = `${tokenSessionId}|${timestamp}|${randomPart}`;
        const expectedSignature = createHmac('sha256', CSRF_SECRET)
            .update(payload)
            .digest('hex')
            .substring(0, 32);

        return signature === expectedSignature;
    } catch {
        return false;
    }
}

/**
 * CSRF Middleware for Elysia
 * Validates CSRF tokens on POST, PUT, DELETE, PATCH requests
 */
export const csrfMiddleware = new Elysia({ name: 'csrf' })
    .derive(({ cookie, headers }) => {
        const sessionId = cookie?.token?.value || '';
        
        return {
            csrf: {
                // Generate new token
                generate: () => generateCSRFToken(sessionId),
                
                // Validate token from header
                validate: (): boolean => {
                    const token = headers['x-csrf-token'];
                    if (!token) return false;
                    return validateCSRFToken(token, sessionId);
                }
            }
        };
    })
    .onBeforeHandle(({ request, csrf, headers }) => {
        const method = request.method.toUpperCase();
        
        // Skip CSRF for safe methods and preflight
        if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
            return;
        }

        // Skip CSRF for API routes that don't need it (login, public endpoints)
        const url = new URL(request.url);
        const skipPaths = ['/auth', '/forgot-pass', '/locales', '/version', '/api/v1/school'];
        if (skipPaths.some(path => url.pathname.startsWith(path))) {
            return;
        }

        // Validate CSRF token
        const token = headers['x-csrf-token'];
        if (!token) {
            return Response.json({ error: 'csrf_token_missing' }, { status: 403 });
        }

        if (!csrf.validate()) {
            return Response.json({ error: 'csrf_token_invalid' }, { status: 403 });
        }
    })
    // Endpoint to get a new CSRF token
    .get('/csrf-token', ({ csrf }) => {
        return { token: csrf.generate() };
    });

export default csrfMiddleware;
