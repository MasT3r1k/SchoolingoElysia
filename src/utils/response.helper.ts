import { Context } from 'elysia';
import { db } from '../../database';
import moment from 'moment';

/**
 * Helper pro získání aktuální expirace tokenu
 */
export async function getTokenExpiration(token: string): Promise<Date | null> {
  if (!token) return null;
  
  const session = await db
    .selectFrom('tokens')
    .select(['tokens.expires'])
    .where('tokens.token', '=', token)
    .where('tokens.expires', '>=', new Date())
    .executeTakeFirst();
    
  return session?.expires || null;
}

/**
 * Vytvoří standardní response s přidaným expires fieldem
 */
export function createResponse(data: any, cookie: any, status: number = 200): Response {
  const token = cookie?.token?.value;
  
  // Pokud máme token, přidáme expires do response
  if (token) {
    // Expires je automaticky updatován v onBeforeHandle, takže můžeme spočítat nový čas
    const expires = moment().add(15, 'minutes').toDate();
    
    return Response.json(
      { ...data, expires },
      { status }
    );
  }
  
  return Response.json(data, { status });
}

/**
 * Vytvoří error response se správným HTTP status kódem
 */
export function createErrorResponse(
  error: string,
  details?: string,
  statusCode?: number
): Response {
  // Mapování error typů na HTTP status kódy
  const statusMap: Record<string, number> = {
    'no_user': 401,
    'unauthorized': 401,
    'token_expired': 401,
    'no_permission': 403,
    'not_found': 404,
    'invalid_username': 400,
    'invalid_password': 400,
    'invalid_tfa': 400,
    'invalid_data': 400,
    'invalid_input': 400,
  };
  
  const status = statusCode || statusMap[error] || 400;
  
  const responseData: any = { error };
  if (details) responseData.details = details;
  
  return Response.json(responseData, { status });
}
