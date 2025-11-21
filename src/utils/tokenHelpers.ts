export interface JWTPayload {
  sub?: string;
  user_id?: string;
  email: string;
  name?: string;
  exp?: number;
  [key: string]: any;
}

export function parseJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decodedPayload = atob(payload);
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('Failed to parse JWT:', error);
    return null;
  }
}

export function isJWTExpired(token: string): boolean {
  const payload = parseJWT(token);
  if (!payload || !payload.exp) {
    return true;
  }

  const expirationTime = payload.exp * 1000;
  return Date.now() >= expirationTime;
}

export function extractUserDataFromJWT(token: string): { id: string; email: string; name: string } | null {
  const payload = parseJWT(token);
  if (!payload) {
    return null;
  }

  return {
    id: payload.sub || payload.user_id || '',
    email: payload.email || '',
    name: payload.name || payload.email?.split('@')[0] || ''
  };
}

export function getJWTExpirationTime(token: string): number {
  const payload = parseJWT(token);
  if (!payload || !payload.exp) {
    return Date.now() + 24 * 60 * 60 * 1000;
  }

  return payload.exp * 1000;
}

export function extractEmailFromToken(token: string): string | null {
  try {
    const payload = parseJWT(token);
    return payload?.email || null;
  } catch (error) {
    console.error('Failed to extract email from token:', error);
    return null;
  }
}
