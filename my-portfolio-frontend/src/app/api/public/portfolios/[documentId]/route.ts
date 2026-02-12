import { NextResponse } from 'next/server';

function getEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ documentId: string }> },
) {
  try {
    const STRAPI_URL = getEnv('STRAPI_URL').replace(/\/$/, '');
    const { documentId } = await params;

    const url = new URL(req.url);
    const qs = url.searchParams.toString();

    const upstream = `${STRAPI_URL}/api/portfolios/${encodeURIComponent(documentId)}${qs ? `?${qs}` : ''}`;

    const res = await fetch(upstream, { cache: 'no-store' });
    const text = await res.text();

    return new NextResponse(text, {
      status: res.status,
      headers: {
        'Content-Type': res.headers.get('content-type') || 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Proxy failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
