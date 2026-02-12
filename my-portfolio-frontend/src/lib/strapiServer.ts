import 'server-only';

type StrapiUploadItem = {
  id: number;
  url: string;
  mime: string;
  name: string;
  size: number;
};

function getEnv(name: string, optional = false) {
  const v = process.env[name];
  if (!v && !optional) throw new Error(`Missing env: ${name}`);
  return v || '';
}

export function getStrapiConfig() {
  return {
    url: getEnv('STRAPI_URL'),
    token: getEnv('STRAPI_API_TOKEN'),
    portfolioEndpoint: process.env.STRAPI_PORTFOLIO_ENDPOINT || '/api/portfolios',
    statusField: process.env.STRAPI_STATUS_FIELD || 'status',
    statusApproved: process.env.STRAPI_STATUS_APPROVED || 'approved',
    statusPending: process.env.STRAPI_STATUS_PENDING || 'pending',
  };
}

export function toAbsoluteStrapiUrl(maybeRelativeUrl: string) {
  const { url } = getStrapiConfig();
  if (!maybeRelativeUrl) return '';
  if (maybeRelativeUrl.startsWith('http://') || maybeRelativeUrl.startsWith('https://')) {
    return maybeRelativeUrl;
  }
  return `${url}${maybeRelativeUrl.startsWith('/') ? '' : '/'}${maybeRelativeUrl}`;
}

export async function strapiUpload(files: File[]): Promise<StrapiUploadItem[]> {
  const { url, token } = getStrapiConfig();

  const fd = new FormData();
  for (const file of files) {
    fd.append('files', file, file.name);
  }

  const res = await fetch(`${url}/api/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: fd,
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = json?.error?.message || json?.message || 'Strapi upload failed';
    throw new Error(msg);
  }

  return json as StrapiUploadItem[];
}

export async function strapiGet<T>(path: string): Promise<T> {
  const { url, token } = getStrapiConfig();
  const res = await fetch(`${url}${path}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = json?.error?.message || json?.message || 'Strapi GET failed';
    throw new Error(msg);
  }
  return json as T;
}

export async function strapiPost<T>(path: string, body: unknown): Promise<T> {
  const { url, token } = getStrapiConfig();
  const res = await fetch(`${url}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = json?.error?.message || json?.message || 'Strapi POST failed';
    throw new Error(msg);
  }
  return json as T;
}

export async function strapiPut<T>(path: string, body: unknown): Promise<T> {
  const { url, token } = getStrapiConfig();
  const res = await fetch(`${url}${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = json?.error?.message || json?.message || 'Strapi PUT failed';
    throw new Error(msg);
  }
  return json as T;
}
