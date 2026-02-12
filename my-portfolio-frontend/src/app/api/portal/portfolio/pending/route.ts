import { NextResponse } from 'next/server';
import { getPortalUserFromCookies } from '@/lib/portalAuth';
import {
  getStrapiConfig,
  strapiGet,
  toAbsoluteStrapiUrl,
} from '@/lib/strapiServer';

// (Strapi v4 media types handled dynamically)


type PortfolioAttributes = {
  createdAt?: string;
  updatedAt?: string;
  status?: string;
  event_name?: string;
  completion_date?: string;
  event_location?: string;
  description?: string;
  // media (v4 uses {data}, v5 uses object/array directly)
  cover_image?: unknown;
  gallery_images?: unknown;
  // v5 fields may appear at root
  documentId?: string;
  publishedAt?: string | null;
  [key: string]: unknown;
};

type StrapiEntity<T> = { id: number; attributes?: T; [key: string]: unknown };

type StrapiListResponse<T> = {
  data: Array<StrapiEntity<T>>;
  meta?: unknown;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object';
}

function unwrapEntry<T extends Record<string, unknown>>(entry: StrapiEntity<T>): (T & { id: number }) {
  if (isRecord(entry) && isRecord(entry.attributes)) {
    return { id: entry.id, ...(entry.attributes as T) };
  }

  // Strapi v5 may return fields at root
  const out: Record<string, unknown> = { ...(entry as Record<string, unknown>) };
  delete out.attributes;
  return out as T & { id: number };
}

function unwrapMedia(field: unknown): unknown {
  // v4 media: { data: { attributes: { url, formats } } }
  if (isRecord(field) && 'data' in field) {
    const data = (field as Record<string, unknown>).data;
    if (Array.isArray(data)) {
      return data.map((x) => (isRecord(x) && isRecord(x.attributes) ? x.attributes : x));
    }
    if (isRecord(data) && isRecord(data.attributes)) return data.attributes;
    return data;
  }

  // v5 media is already the object or array
  return field;
}

export async function GET() {
  const user = await getPortalUserFromCookies();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { portfolioEndpoint, statusField, statusPending } = getStrapiConfig();

  try {
    const path =
      `${portfolioEndpoint}` +
      `?sort[0]=createdAt:desc` +
      `&filters[${encodeURIComponent(statusField)}][$eq]=${encodeURIComponent(statusPending)}` +
      `&fields[0]=event_name` +
      `&fields[1]=completion_date` +
      `&fields[2]=event_location` +
      `&fields[3]=description` +
      `&fields[4]=${encodeURIComponent(statusField)}` +
      `&fields[5]=createdAt` +
      `&fields[6]=updatedAt` +
      `&populate[0]=cover_image` +
      `&populate[1]=gallery_images` +
      `&pagination[pageSize]=50`;

    const json = await strapiGet<StrapiListResponse<PortfolioAttributes>>(path);

    const items = (json.data || []).map((raw) => {
      const e = unwrapEntry<PortfolioAttributes>(raw);
      const er = e as Record<string, unknown>;

      const cover = unwrapMedia(er.cover_image);
      const coverUrl = isRecord(cover) && typeof cover.url === 'string'
        ? toAbsoluteStrapiUrl(cover.url)
        : null;

      const gallery = unwrapMedia(er.gallery_images);
      const galleryArr = Array.isArray(gallery) ? gallery : [];
      const galleryUrls = galleryArr
        .map((x) => (isRecord(x) && typeof x.url === 'string' ? x.url : null))
        .filter((u): u is string => Boolean(u))
        .map((u) => toAbsoluteStrapiUrl(u));

      const statusValue = er[statusField];

      return {
        id: e.id,
        documentId: typeof er.documentId === 'string' ? er.documentId : null,
        createdAt: typeof er.createdAt === 'string' ? er.createdAt : null,
        updatedAt: typeof er.updatedAt === 'string' ? er.updatedAt : null,
        event_name: typeof er.event_name === 'string' ? er.event_name : null,
        completion_date: typeof er.completion_date === 'string' ? er.completion_date : null,
        event_location: typeof er.event_location === 'string' ? er.event_location : null,
        description: typeof er.description === 'string' ? er.description : null,
        status:
          typeof statusValue === 'string'
            ? statusValue
            : typeof er.status === 'string'
              ? er.status
              : null,
        coverUrl,
        galleryUrls,
      };
    });

    return NextResponse.json({ ok: true, items, meta: json.meta ?? null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load pending list';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
