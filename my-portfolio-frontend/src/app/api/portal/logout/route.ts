import { NextResponse } from 'next/server';
import { PORTAL_SESSION_COOKIE } from '@/lib/portalSession';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(PORTAL_SESSION_COOKIE, '', { httpOnly: true, maxAge: 0, path: '/' });
  return res;
}
