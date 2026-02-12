'use client';

import { useEffect, useState } from 'react';

type PendingResponse = {
  ok: true;
  items: unknown[];
  meta?: unknown;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object';
}

function getString(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v : null;
}

function getStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}

export default function PortalAdminPage() {
  const [data, setData] = useState<PendingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function reload() {
    setLoading(true);
    try {
      setError(null);
      const res = await fetch('/api/portal/portfolio/pending', { cache: 'no-store' });
      const json = (await res.json().catch(() => null)) as unknown;

      if (!res.ok) {
        const msg = isRecord(json) && typeof json.error === 'string' ? json.error : 'Failed to load pending list';
        setError(msg);
        setData(null);
        return;
      }

      setData(json as PendingResponse);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-black/30 p-6 backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Admin</h2>
            <p className="mt-2 text-sm text-white/60">
              Pending list from Strapi via <code>/api/portal/portfolio/pending</code>
            </p>
          </div>

          <button
            onClick={() => void reload()}
            disabled={loading}
            className="rounded-xl bg-white/10 px-4 py-2 text-sm text-white/90 hover:bg-white/15 disabled:opacity-60"
          >
            {loading ? '刷新中…' : '刷新'}
          </button>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">
            {error}
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/30 p-6 backdrop-blur">
        <h3 className="text-lg font-semibold">Pending portfolios（JSON）</h3>
        <pre className="mt-4 overflow-auto rounded-xl bg-black/40 p-4 text-xs text-white/80">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/30 p-6 backdrop-blur">
        <h3 className="text-lg font-semibold">Pending portfolios（UI）</h3>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {(data?.items || []).map((item, idx) => {
            const r = isRecord(item) ? item : {};
            const title = getString(r.event_name) ?? `Item #${idx + 1}`;
            const date = getString(r.completion_date);
            const location = getString(r.event_location);
            const status = getString(r.status);
            const coverUrl = getString(r.coverUrl);
            const galleryUrls = getStringArray(r.galleryUrls);
            const documentId = getString(r.documentId);
            const reviewKey = documentId ?? (typeof r.id === 'number' || typeof r.id === 'string' ? String(r.id) : '');

            return (
              <div
                key={(typeof r.id === 'number' || typeof r.id === 'string') ? String(r.id) : String(idx)}
                className="rounded-2xl border border-white/10 bg-black/20 p-4"
              >
                <div className="flex gap-4">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                    {coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={coverUrl} alt={title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-white/50">
                        No cover
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="truncate text-base font-semibold">{title}</div>
                      {status ? (
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/80">
                          {status}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-1 text-sm text-white/70">
                      {date ? <span>{date}</span> : <span className="text-white/40">（無日期）</span>}
                      {' '}·{' '}
                      {location ? <span>{location}</span> : <span className="text-white/40">（無地點）</span>}
                    </div>

                    <div className="mt-2 text-xs text-white/50">
                      gallery: {galleryUrls.length} 張
                      {documentId ? (
                        <>
                          {' '}· documentId: <code className="text-white/70">{documentId}</code>
                        </>
                      ) : null}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={!reviewKey || loading}
                        className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-100 hover:bg-emerald-500/30 disabled:opacity-50"
                        onClick={async () => {
                          if (!reviewKey) return;
                          setLoading(true);
                          try {
                            const res = await fetch('/api/portal/portfolio/review', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ key: reviewKey, decision: 'approve' }),
                            });
                            const j = await res.json().catch(() => null);
                            if (!res.ok) {
                              const msg = isRecord(j) && typeof j.error === 'string' ? j.error : 'Approve failed';
                              setError(msg);
                              return;
                            }
                            await reload();
                          } finally {
                            setLoading(false);
                          }
                        }}
                      >
                        Approve
                      </button>

                      <button
                        type="button"
                        disabled={!reviewKey || loading}
                        className="rounded-full bg-rose-500/20 px-3 py-1 text-xs text-rose-100 hover:bg-rose-500/30 disabled:opacity-50"
                        onClick={async () => {
                          if (!reviewKey) return;
                          if (!confirm('確定要 Reject 嗎？')) return;
                          setLoading(true);
                          try {
                            const res = await fetch('/api/portal/portfolio/review', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ key: reviewKey, decision: 'reject' }),
                            });
                            const j = await res.json().catch(() => null);
                            if (!res.ok) {
                              const msg = isRecord(j) && typeof j.error === 'string' ? j.error : 'Reject failed';
                              setError(msg);
                              return;
                            }
                            await reload();
                          } finally {
                            setLoading(false);
                          }
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>

                {galleryUrls.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {galleryUrls.slice(0, 6).map((u) => (
                      <a
                        key={u}
                        href={u}
                        target="_blank"
                        rel="noreferrer"
                        className="h-14 w-14 overflow-hidden rounded-lg border border-white/10 bg-white/5"
                        title="Open image"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={u} alt="gallery" className="h-full w-full object-cover" />
                      </a>
                    ))}
                    {galleryUrls.length > 6 ? (
                      <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-xs text-white/60">
                        +{galleryUrls.length - 6}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}

          {data && Array.isArray(data.items) && data.items.length === 0 ? (
            <div className="text-sm text-white/60">目前沒有 pending。</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
