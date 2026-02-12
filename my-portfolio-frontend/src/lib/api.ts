// src/lib/api.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
// 用 127.0.0.1 避免某些環境下 localhost 解析到 ::1 (IPv6) 造成連線失敗
// NOTE: Client-side (phone) cannot reach your Mac's 127.0.0.1. For browser fetches,
// we proxy via Next API routes under /api/public/*.
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://127.0.0.1:1337';

function publicApiBase() {
  // In browser, call same-origin proxy so it works over LAN IP.
  if (typeof window !== 'undefined') return '';
  return API_BASE;
}
const SLUG = 'portfolios';

type MediaFormats = {
  small?: { url?: string };
};

export type SimpleMedia = {
  formats?: MediaFormats;
  url?: string;
};

export type SimpleItem = {
  id: number;
  documentId?: string;
  title: string;
  description?: string;
  photo?: SimpleMedia;
};

function unwrapEntry(entry: any) {
  // Strapi v4: { id, attributes: { ... } }
  if (entry && typeof entry === 'object' && entry.attributes) {
    return { id: entry.id, ...entry.attributes };
  }
  // Strapi v5 (or custom): fields may already be at root
  return entry;
}

function unwrapMedia(field: any): any {
  // Strapi v4 media: { data: { attributes: { url, formats } } }
  if (field?.data) {
    if (Array.isArray(field.data)) {
      return field.data.map((x: any) => x?.attributes ?? x);
    }
    return field.data?.attributes ?? field.data;
  }
  return field;
}

async function fetchJson(url: string) {
  const res = await fetch(url, { next: { revalidate: 10 } });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Strapi request failed: ${res.status} ${res.statusText} :: ${url}\n${text}`);
  }
  return res.json();
}

export async function getEnvironments(): Promise<SimpleItem[]> { // list
  const json = await fetchJson(`${API_BASE}/api/environments?populate=*`);
  const data = Array.isArray(json.data) ? json.data : [];

  return data.map((raw: any) => {
    const e = unwrapEntry(raw);
    return {
      id: e.id,
      documentId: e.documentId ?? e.document_id,
      title: e.title ?? e.name ?? String(e.id),
      description: e.description,
      photo: unwrapMedia(e.photo),
    };
  });
}

export async function getEnvironment(documentId: string): Promise<SimpleItem> {
  const json = await fetchJson(`${API_BASE}/api/environments/${encodeURIComponent(documentId)}?populate=*`);
  const e = unwrapEntry(json.data);
  return {
    id: e.id,
    documentId: e.documentId ?? e.document_id ?? documentId,
    title: e.title ?? e.name ?? String(e.id),
    description: e.description,
    photo: unwrapMedia(e.photo),
  };
}

export async function getMachines(): Promise<SimpleItem[]> { // list
  const json = await fetchJson(`${API_BASE}/api/machines?populate=*`);
  const data = Array.isArray(json.data) ? json.data : [];

  return data.map((raw: any) => {
    const e = unwrapEntry(raw);
    return {
      id: e.id,
      documentId: e.documentId ?? e.document_id,
      title: e.title ?? e.name ?? String(e.id),
      description: e.description,
      photo: unwrapMedia(e.photo),
    };
  });
}

export async function getMachine(documentId: string): Promise<SimpleItem> {
  const json = await fetchJson(`${API_BASE}/api/machines/${encodeURIComponent(documentId)}?populate=*`);
  const e = unwrapEntry(json.data);
  return {
    id: e.id,
    documentId: e.documentId ?? e.document_id ?? documentId,
    title: e.title ?? e.name ?? String(e.id),
    description: e.description,
    photo: unwrapMedia(e.photo),
  };
}

export interface PortfolioItem {
  id: number;
  documentId?: string;
  /**
   * UI display title. Decision: use event_name as title.
   * (If Strapi also has a title field, event_name takes priority.)
   */
  title: string;
  event_name: string;
  completion_date?: string;
  event_location?: string;
  description?: any;
  coverUrl?: string | null;
  galleryUrls?: string[];
}

function pickMediaUrl(media: any): string {
  const m = unwrapMedia(media);
  if (!m) return '';
  const url = (m?.formats?.small?.url ?? m?.url ?? '') as string;
  if (!url) return '';
  // Prefer keeping relative URLs ("/uploads/...") so Next rewrites can proxy to Strapi.
  // This makes it work when viewing the site via LAN IP on a phone.
  return url;
}

export async function getPortfolios(): Promise<PortfolioItem[]> {
  // Sort by completion_date desc, then createdAt desc as a tiebreaker.
  const base = publicApiBase();
  const url = base
    ? `${base}/api/${SLUG}?populate=*&sort[0]=completion_date:desc&sort[1]=createdAt:desc`
    : `/api/public/portfolios?populate=*&sort[0]=completion_date:desc&sort[1]=createdAt:desc`;

  const json = await fetchJson(url);
  const data = Array.isArray(json.data) ? json.data : [];

  return data.map((raw: any): PortfolioItem => {
    const e = unwrapEntry(raw);

    const coverUrl = pickMediaUrl(e.cover_image);
    const gallery = unwrapMedia(e.gallery_images);
    const galleryUrls = Array.isArray(gallery) ? gallery.map((g: any) => pickMediaUrl(g)).filter(Boolean) : [];

    const eventName = (e.event_name ?? e.title ?? '').toString();

    return {
      id: e.id,
      documentId: e.documentId ?? e.document_id,
      title: eventName || String(e.id),
      event_name: eventName,
      completion_date: e.completion_date,
      event_location: e.event_location,
      description: e.description,
      coverUrl,
      galleryUrls,
    };
  });
}

export async function getPortfolio(documentId: string) {
  // 先嘗試用 /:documentId 取單筆（你的 routing 目前也是這樣）
  const base = publicApiBase();
  const directUrl = base
    ? `${base}/api/${SLUG}/${encodeURIComponent(documentId)}?populate=*`
    : `/api/public/portfolios/${encodeURIComponent(documentId)}?populate=*`;

  try {
    const json = await fetchJson(directUrl);
    const e = unwrapEntry(json.data);
    const eventName = (e.event_name ?? e.title ?? '').toString();

    return {
      id: e.id,
      documentId: e.documentId ?? e.document_id ?? documentId,
      title: eventName || String(e.id),
      event_name: eventName,
      description: e.description,
      completion_date: e.completion_date,
      event_location: e.event_location,
      coverUrl: pickMediaUrl(e.cover_image) || null,
      galleryUrls: (Array.isArray(unwrapMedia(e.gallery_images))
        ? unwrapMedia(e.gallery_images).map((g: any) => pickMediaUrl(g)).filter(Boolean)
        : []),
    };
  } catch (err: any) {
    // 若 Strapi 不支援用 documentId 當 path param，再用 filters 查
    const listUrl = base
      ? `${base}/api/${SLUG}?filters[documentId][$eq]=${encodeURIComponent(documentId)}&populate=*`
      : `/api/public/portfolios?filters[documentId][$eq]=${encodeURIComponent(documentId)}&populate=*`;
    const json = await fetchJson(listUrl);
    const first = Array.isArray(json.data) ? json.data[0] : null;
    if (!first) throw err;

    const e = unwrapEntry(first);
    const eventName = (e.event_name ?? e.title ?? '').toString();

    return {
      id: e.id,
      documentId: e.documentId ?? e.document_id ?? documentId,
      title: eventName || String(e.id),
      event_name: eventName,
      description: e.description,
      completion_date: e.completion_date,
      event_location: e.event_location,
      coverUrl: pickMediaUrl(e.cover_image) || null,
      galleryUrls: (Array.isArray(unwrapMedia(e.gallery_images))
        ? unwrapMedia(e.gallery_images).map((g: any) => pickMediaUrl(g)).filter(Boolean)
        : []),
    };
  }
}
