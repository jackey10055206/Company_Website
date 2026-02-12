import { NextResponse } from 'next/server';
import { getPortalUserFromCookies } from '@/lib/portalAuth';
import { getStrapiConfig, strapiGet } from '@/lib/strapiServer';

type StrapiListResponse = {
  data: unknown[];
  meta?: unknown;
};

export async function GET() {
  const user = await getPortalUserFromCookies();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { portfolioEndpoint, statusField } = getStrapiConfig();

  try {
    const path =
      `${portfolioEndpoint}` +
      `?sort[0]=createdAt:desc` +
      // NOTE: Strapi portfolio currently does not have uploader_username field.
      // Until we add it, we list recent items without ownership filtering.
      `&fields[0]=event_name` +
      `&fields[1]=completion_date` +
      `&fields[2]=event_location` +
      `&fields[3]=description` +
      `&fields[4]=${encodeURIComponent(statusField)}` +
      `&fields[5]=createdAt` +
      `&fields[6]=updatedAt` +
      `&pagination[pageSize]=20`;

    const json = await strapiGet<StrapiListResponse>(path);
    return NextResponse.json({ ok: true, items: json.data ?? [], meta: json.meta ?? null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load portfolios';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
