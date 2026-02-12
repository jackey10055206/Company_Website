import { NextResponse } from 'next/server';
import { getPortalUserFromCookies } from '@/lib/portalAuth';

export async function GET() {
  const user = await getPortalUserFromCookies();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ ok: true, user });
}
