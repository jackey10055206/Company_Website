import { NextResponse } from 'next/server';
import { getPortalUserFromCookies } from '@/lib/portalAuth';
import {
  getStrapiConfig,
  strapiGet,
  strapiPost,
  strapiPut,
  strapiUpload,
} from '@/lib/strapiServer';

const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8MB each
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
  note?: string;
  submittedByUsername?: string;
  submittedByRole?: string;
  publishedAt?: string | null;
  // plus any custom fields on your content-type
  [key: string]: unknown;
};

type StrapiSingleResponse<T> = { data: StrapiEntity<T> | null };

type StrapiCreateUpdateResponse<T> = { data: StrapiEntity<T> };

export async function POST(req: Request) {
  const user = await getPortalUserFromCookies();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const note = (formData.get('note') || '').toString();
  const idRaw = (formData.get('id') || '').toString().trim();
  const isUpdate = Boolean(idRaw);
  const id = isUpdate ? Number(idRaw) : null;
  if (isUpdate && (!id || Number.isNaN(id))) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const cover = formData.get('cover');
  const galleryValues = formData.getAll('gallery');

  if (!isFile(cover)) {
    return NextResponse.json({ error: 'Missing cover image' }, { status: 400 });
  }

  const galleryFiles = galleryValues.filter(isFile);
  if (galleryValues.length !== galleryFiles.length) {
    return NextResponse.json({ error: 'Invalid gallery files' }, { status: 400 });
  }

  try {
    validateImage(cover, 'Cover');
    for (let i = 0; i < galleryFiles.length; i++) {
      validateImage(galleryFiles[i], `Gallery[${i + 1}]`);
    }

    const { portfolioEndpoint, statusField, statusApproved, statusPending } =
      getStrapiConfig();

    // 1) Upload media to Strapi
    const uploaded = await strapiUpload([cover, ...galleryFiles]);
    const coverUpload = uploaded[0];
    const galleryUploads = uploaded.slice(1);

    // 2) Create / update portfolio entry
    const baseData: Record<string, unknown> = {
      note,
      submittedByUsername: user.username,
      submittedByRole: user.role,
      cover: coverUpload?.id,
      gallery: galleryUploads.map((x) => x.id),
      [statusField]: statusPending,
    };

    if (!isUpdate) {
      const created = await strapiPost<StrapiCreateUpdateResponse<PortfolioAttributes>>(
        portfolioEndpoint,
        { data: baseData },
      );

      return NextResponse.json({ ok: true, mode: 'create', id: created.data.id });
    }

    // Enforce: if uploader edits an approved+published entry -> unpublish + pending.
    // (Admins can still update without forcing unpublish.)
    const existing = await strapiGet<StrapiSingleResponse<PortfolioAttributes>>(
      `${portfolioEndpoint}/${id}?fields[0]=publishedAt&fields[1]=${encodeURIComponent(
        statusField,
      )}`,
    );

    const existingAttrs = existing.data?.attributes || {};
    const existingStatus = String(existingAttrs[statusField] ?? '');
    const wasPublished = !!existingAttrs.publishedAt;

    const data: Record<string, unknown> = { ...baseData };
    if (user.role !== 'admin' && existingStatus === statusApproved && wasPublished) {
      data.publishedAt = null;
      data[statusField] = statusPending;
    }

    const updated = await strapiPut<StrapiCreateUpdateResponse<PortfolioAttributes>>(
      `${portfolioEndpoint}/${id}`,
      { data },
    );

    return NextResponse.json({ ok: true, mode: 'update', id: updated.data.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Submit failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
