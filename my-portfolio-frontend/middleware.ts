import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { PORTAL_SESSION_COOKIE } from './src/lib/portalSession';

const enc = new TextEncoder();

async function readRoleFromSession(token: string): Promise<'uploader' | 'admin' | null> {
  try {
    const secret = process.env.PORTAL_SESSION_SECRET;
    if (!secret) return null;
    const { payload } = await jwtVerify(token, enc.encode(secret));
    const role = payload.r === 'admin' ? 'admin' : payload.r === 'uploader' ? 'uploader' : null;
    return role;
  } catch {
    return null;
  }
}

function isPortalPath(pathname: string) {
  return pathname === '/portal' || pathname.startsWith('/portal/');
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (!isPortalPath(pathname)) return NextResponse.next();

  // Allow portal login page.
  if (pathname === '/portal/login') return NextResponse.next();

  // Require signed session cookie for all other /portal pages.
  const token = req.cookies.get(PORTAL_SESSION_COOKIE)?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/portal/login';
    url.searchParams.set('next', pathname + (search || ''));
    return NextResponse.redirect(url);
  }

  const role = await readRoleFromSession(token);
  if (!role) {
    const url = req.nextUrl.clone();
    url.pathname = '/portal/login';
    url.searchParams.set('next', pathname + (search || ''));
    return NextResponse.redirect(url);
  }

  // Admin guard
  if (pathname.startsWith('/portal/admin')) {
    if (role !== 'admin') {
      const url = req.nextUrl.clone();
      url.pathname = '/portal/dashboard';
      url.search = '';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/portal/:path*'],
};
