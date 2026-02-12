import { NextResponse } from 'next/server';
import { getPortalUserFromCookies } from '@/lib/portalAuth';
import { getStrapiConfig, strapiPut } from '@/lib/strapiServer';

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object';
}

export async function POST(req: Request) {
  const user = await getPortalUserFromCookies();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = (await req.json().catch(() => null)) as unknown;
  if (!isRecord(body)) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const key = typeof body.key === 'string' ? body.key.trim() : '';
  const decision = typeof body.decision === 'string' ? body.decision : '';

  if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 });
  if (decision !== 'approve' && decision !== 'reject') {
    return NextResponse.json({ error: 'Invalid decision' }, { status: 400 });
  }

  const { portfolioEndpoint, statusField, statusApproved } = getStrapiConfig();

  const reviewedAt = new Date().toISOString();

  const data: Record<string, unknown> = {
    [statusField]: decision === 'approve' ? statusApproved : 'rejected',
    reviewed_at: reviewedAt,
  };

  // NOTE: In Strapi v5 with Draft & Publish enabled, published state is managed by
  // /actions/publish and /actions/unpublish. Setting publishedAt directly may be ignored.
  // We still keep publishedAt out of here and use actions below.

  try {
    // 1) Update review fields/status
    const updated = (await strapiPut(`${portfolioEndpoint}/${encodeURIComponent(key)}`, { data })) as unknown;

    // 2) Publish/unpublish via Strapi actions (Draft & Publish)
    if (decision === 'approve') {
      // Strapi v5 expects POST for actions
      await fetch(`${getStrapiConfig().url}${portfolioEndpoint}/${encodeURIComponent(key)}/actions/publish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getStrapiConfig().token}` },
      });
    } else {
      await fetch(`${getStrapiConfig().url}${portfolioEndpoint}/${encodeURIComponent(key)}/actions/unpublish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getStrapiConfig().token}` },
      });
    }

    const payload = isRecord(updated) && isRecord(updated.data) ? updated.data : updated;
    return NextResponse.json({ ok: true, decision, key, portfolio: payload });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Review failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
