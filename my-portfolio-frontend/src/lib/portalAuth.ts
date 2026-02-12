// src/lib/portalAuth.ts
import { cookies } from 'next/headers';
import { PORTAL_SESSION_COOKIE, verifyPortalSession, type PortalRole } from './portalSession';

export type PortalUser = {
  username: string;
  role: PortalRole;
};

// Next.js 15+: cookies() is async in Server Components / Route Handlers.
export async function getPortalUserFromCookies(): Promise<PortalUser | null> {
  const store = await cookies();
  const token = store.get(PORTAL_SESSION_COOKIE)?.value;
  if (!token) return null;

  return await verifyPortalSession(token);
}
