// src/lib/portalSession.ts
// Signed session cookie using JWT (HS256) via jose.

import 'server-only';
import { SignJWT, jwtVerify } from 'jose';

export type PortalRole = 'uploader' | 'admin';
export type PortalSession = {
  username: string;
  role: PortalRole;
};

export const PORTAL_SESSION_COOKIE = 'portal_session';

function getSecret() {
  const s = process.env.PORTAL_SESSION_SECRET;
  if (!s) throw new Error('PORTAL_SESSION_SECRET is not set');
  return new TextEncoder().encode(s);
}

export async function signPortalSession(session: PortalSession) {
  const secret = getSecret();
  // 30 days is fine for MVP; we can shorten later.
  return await new SignJWT({ u: session.username, r: session.role })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret);
}

export async function verifyPortalSession(token: string): Promise<PortalSession | null> {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret);
    const username = typeof payload.u === 'string' ? payload.u : '';
    const role = payload.r === 'admin' ? 'admin' : payload.r === 'uploader' ? 'uploader' : null;
    if (!username || !role) return null;
    return { username, role };
  } catch {
    return null;
  }
}
