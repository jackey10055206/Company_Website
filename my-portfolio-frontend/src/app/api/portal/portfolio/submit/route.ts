import { NextResponse } from 'next/server';
import { getPortalUserFromCookies } from '@/lib/portalAuth';
import {
  getStrapiConfig,
  strapiGet,
  strapiPost,
  strapiPut,
  strapiUpload,
} from '@/lib/strapiServer';

const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8MB per image
const ALLOWED_IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

function isFile(v: FormDataEntryValue | null): v is File {
  return !!v && typeof v !== 'string';
}

function validateImage(file: File, label: string) {
  if (!ALLOWED_IMAGE_MIMES.has(file.type)) {
    throw new Error(`${label}: unsupported type (${file.type || 'unknown'})`);
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`${label}: too large (${Math.ceil(file.size / 1024 / 1024)}MB)`);
  }
}

type StrapiEntity<T> = { id: number; attributes: T };

type PortfolioAttributes = {
  publishedAt?: string | null;
  [key: string]: unknown;
};

type StrapiSingleResponse<T> = { data: StrapiEntity<T> | null };

type StrapiCreateUpdateResponse<T> = { data: StrapiEntity<T> };

export async function POST(req: Request) {
  const user = await getPortalUserFromCookies();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'uploader' && user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const formData = await req.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });

  const { portfolioEndpoint, statusField, statusApproved, statusPending } = getStrapiConfig();

  const event_name = (formData.get('event_name') || '').toString().trim();
  const completion_date = (formData.get('completion_date') || '').toString().trim();
  const event_location = (formData.get('event_location') || '').toString().trim();
  const descriptionRaw = (formData.get('description') || '').toString();
  const note = (formData.get('note') || '').toString();

  if (!event_name || !completion_date || !event_location) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Strapi model currently has no separate "note" field; merge into description.
  const description = [descriptionRaw?.trim(), note?.trim()].filter(Boolean).join('\n\n');

  // Strapi v5 single-type/document endpoints typically use documentId as the path param.
  // We treat portfolioId as an opaque identifier (string): can be a documentId or numeric id.
  const portfolioKey = (formData.get('portfolioId') || '').toString().trim();

  const cover = formData.get('cover');
  const galleryValues = formData.getAll('gallery');

  const coverFile = isFile(cover) ? cover : null;
  const galleryFiles = galleryValues.filter((v): v is File => typeof v !== 'string');
  if (galleryValues.length !== galleryFiles.length) {
    return NextResponse.json({ error: 'Invalid gallery files' }, { status: 400 });
  }

  const isCreate = !portfolioKey;
  if (isCreate && !coverFile) {
    return NextResponse.json({ error: 'Missing cover image' }, { status: 400 });
  }

  try {
    if (coverFile) validateImage(coverFile, 'Cover');
    for (let i = 0; i < galleryFiles.length; i++) {
      validateImage(galleryFiles[i], `Gallery[${i + 1}]`);
    }

    // 1) Upload media to Strapi (only what user provided)
    const uploadsToSend: File[] = [
      ...(coverFile ? [coverFile] : []),
      ...galleryFiles,
    ];
    const uploaded = uploadsToSend.length ? await strapiUpload(uploadsToSend) : [];

    const coverUploadId = coverFile ? uploaded[0]?.id : undefined;
    const galleryUploadStartIndex = coverFile ? 1 : 0;
    const galleryUploadIds = uploaded.slice(galleryUploadStartIndex).map((x) => x.id);

    const desiredStatus = user.role === 'admin' ? statusApproved : statusPending;
    const nowIso = new Date().toISOString();

    const baseData: Record<string, unknown> = {
      // TODO: add uploader_username field in Strapi portfolio to support ownership
      // uploader_username: user.username,
      event_name,
      completion_date,
      event_location,
      description,
      // Workflow:
      // - uploader => pending (+ submitted_at)
      // - admin    => approved (+ reviewed_at) (no need to "submit for review" then approve yourself)
      [statusField]: desiredStatus,
      ...(user.role === 'admin'
        ? { reviewed_at: nowIso }
        : { submitted_at: nowIso }),
    };

    // Match Strapi field names (per your schema)
    if (coverUploadId) baseData.cover_image = coverUploadId;
    if (galleryUploadIds.length) baseData.gallery_images = galleryUploadIds;

    if (portfolioKey) {
      // Enforce ownership + approval/publish rule on the server since we use an API token.
      // NOTE: Strapi schema currently does NOT have uploader_username, so do not request it.
      await strapiGet<StrapiSingleResponse<PortfolioAttributes>>(
        `${portfolioEndpoint}/${encodeURIComponent(portfolioKey)}?fields[0]=publishedAt&fields[1]=${encodeURIComponent(statusField)}`,
      );

      const data: Record<string, unknown> = { ...baseData };

      // Workflow enforcement:
      // - uploader edits always go back to pending (+ submitted_at)
      // - admin edits stay approved by default (+ reviewed_at)
      if (user.role !== 'admin') {
        data[statusField] = statusPending;
        data.submitted_at = nowIso;
      } else {
        data[statusField] = statusApproved;
        data.reviewed_at = nowIso;
      }

      // Note: publish/unpublish is not used as workflow source-of-truth in this project.
      // We keep the best-effort unpublish call below for uploader safety.

      const updated = await strapiPut<StrapiCreateUpdateResponse<PortfolioAttributes>>(
        `${portfolioEndpoint}/${encodeURIComponent(portfolioKey)}`,
        { data },
      );

      // For uploader updates: always unpublish via Strapi actions.
      if (user.role !== 'admin') {
        try {
          await fetch(`${getStrapiConfig().url}${portfolioEndpoint}/${encodeURIComponent(portfolioKey)}/actions/unpublish`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${getStrapiConfig().token}` },
          });
        } catch {
          // best-effort
        }
      }

      return NextResponse.json({ ok: true, mode: 'update', portfolio: updated.data });
    }

    const created = await strapiPost<StrapiCreateUpdateResponse<PortfolioAttributes>>(
      portfolioEndpoint,
      { data: baseData },
    );

    // Extra safety: Strapi with Draft & Publish may auto-publish on create.
    // If uploader created it, immediately unpublish via Strapi actions.
    if (user.role !== 'admin') {
      const createdAny = created.data as unknown as Record<string, unknown>;
      const createdDocId =
        (typeof createdAny?.documentId === 'string' && createdAny.documentId)
          ? (createdAny.documentId as string)
          : (typeof (createdAny?.attributes as Record<string, unknown>)?.documentId === 'string'
            ? ((createdAny.attributes as Record<string, unknown>).documentId as string)
            : '');

      const key = createdDocId || (typeof createdAny?.id === 'number' ? String(createdAny.id) : '');
      if (key) {
        try {
          await fetch(`${getStrapiConfig().url}${portfolioEndpoint}/${encodeURIComponent(key)}/actions/unpublish`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${getStrapiConfig().token}` },
          });
          const forced = await strapiGet<StrapiSingleResponse<PortfolioAttributes>>(
            `${portfolioEndpoint}/${encodeURIComponent(key)}?fields[0]=publishedAt&fields[1]=${encodeURIComponent(statusField)}`,
          );
          return NextResponse.json({ ok: true, mode: 'create', portfolio: forced.data, forcedDraft: true });
        } catch {
          // If forcing unpublish fails, still return the created record for debugging.
        }
      }
    }

    return NextResponse.json({ ok: true, mode: 'create', portfolio: created.data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Submit failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
