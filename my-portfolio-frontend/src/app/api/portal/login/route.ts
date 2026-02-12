import { NextResponse } from 'next/server';
import { signPortalSession, PORTAL_SESSION_COOKIE, type PortalRole } from '@/lib/portalSession';

function badAuth() {
  return NextResponse.json({ error: 'Invalid username/password' }, { status: 401 });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const normalizeUser = (v: unknown) => {
    // Handle IME/full-width characters + accidental spaces.
    const s = (v ?? '').toString().normalize('NFKC');
    return s.replace(/[\s\u200B\u200C\u200D\uFEFF]/g, '').trim();
  };

  const usernameRaw = normalizeUser(body?.username);
  const username = usernameRaw.toLowerCase();
  const password = (body?.password || '').toString();

  if (!username || !password) {
    return NextResponse.json({ error: 'Missing username/password' }, { status: 400 });
  }

  const uploaderUser = (process.env.PORTAL_UPLOADER_USER || '').toLowerCase();
  const uploaderPass = process.env.PORTAL_UPLOADER_PASS || '';
  const adminUser = (process.env.PORTAL_ADMIN_USER || '').toLowerCase();
  const adminPass = process.env.PORTAL_ADMIN_PASS || '';

  let role: PortalRole | null = null;
  // Admin takes precedence if both matched (shouldn't happen, but safer).
  if (username === adminUser && password === adminPass) role = 'admin';
  else if (username === uploaderUser && password === uploaderPass) role = 'uploader';

  if (!role) return badAuth();

  // Keep original casing for display in UI/session.
  const token = await signPortalSession({ username: usernameRaw, role });

  const res = NextResponse.json({ ok: true, user: { username, role } });

  res.cookies.set(PORTAL_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30,
  });

  return res;
}
