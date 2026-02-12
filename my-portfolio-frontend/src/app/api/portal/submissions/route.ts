import { NextResponse } from 'next/server';
import { getPortalUserFromCookies } from '@/lib/portalAuth';
import { getStrapiConfig, strapiGet, toAbsoluteStrapiUrl } from '@/lib/strapiServer';

type StrapiMediaEntity = { attributes: { url: string } };

type PortfolioAttributes = {
  createdAt: string;
  note?: string;
  submittedByUsername?: string;
  submittedByRole?: string;
  status?: string;
  cover?: { data: StrapiMediaEntity | null };
  gallery?: { data: StrapiMediaEntity[] };
  [key: string]: unknown;
};

type StrapiEntity<T> = { id: number; attributes: T };

type StrapiListResponse<T> = { data: Array<StrapiEntity<T>> };

export async function GET() {
  const user = await getPortalUserFromCookies();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { portfolioEndpoint } = getStrapiConfig();
    const res = await strapiGet<StrapiListResponse<PortfolioAttributes>>(
      `${portfolioEndpoint}?populate[0]=cover&populate[1]=gallery&sort[0]=createdAt:desc&pagination[pageSize]=50`,
    );

    const items = (res.data || []).map((p) => {
      const coverUrl = p.attributes.cover?.data?.attributes?.url
        ? toAbsoluteStrapiUrl(p.attributes.cover.data.attributes.url)
        : null;

      const galleryUrls = (p.attributes.gallery?.data || [])
        .map((x) => x.attributes.url)
        .filter(Boolean)
        .map((u) => toAbsoluteStrapiUrl(u));

      return {
        id: p.id,
        createdAt: p.attributes.createdAt,
        status: p.attributes.status ?? null,
        note: p.attributes.note ?? '',
        submittedBy: {
          username: p.attributes.submittedByUsername ?? null,
          role: p.attributes.submittedByRole ?? null,
        },
        coverUrl,
        galleryUrls,
      };
    });

    return NextResponse.json({ ok: true, items });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load submissions';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
