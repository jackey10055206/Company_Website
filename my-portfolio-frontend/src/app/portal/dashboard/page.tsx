'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type Item = {
  id: number;
  documentId: string | null;
  event_name: string | null;
  completion_date: string | null;
  event_location: string | null;
  status: string | null;
  publishedAt: string | null;
  coverUrl: string | null;
  galleryUrls: string[];
};

type MeResponse = { ok: true; user: { username: string; role: string } };

type ListResponse = { ok: true; items: Item[] };

function badge(status: string | null, publishedAt: string | null) {
  // Status is the source of truth for workflow.
  if (status === 'rejected') return { text: '已拒絕', cls: 'border-rose-400/30 bg-rose-500/10 text-rose-100' };
  if (status === 'pending') return { text: '審核中', cls: 'border-amber-400/30 bg-amber-500/10 text-amber-100' };
  if (status === 'approved') {
    return publishedAt
      ? { text: '已發佈', cls: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100' }
      : { text: '已通過', cls: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100' };
  }
  // Fallback
  return publishedAt
    ? { text: '已發佈', cls: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100' }
    : { text: '審核中', cls: 'border-amber-400/30 bg-amber-500/10 text-amber-100' };
}

export default function PortalDashboardPage() {
  const [me, setMe] = useState<MeResponse['user'] | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    (async () => {
      setError(null);
      setLoading(true);
      const meRes = await fetch('/api/portal/me', { cache: 'no-store' });
      const meJson = (await meRes.json().catch(() => null)) as MeResponse | null;
      if (meRes.ok && meJson?.ok) setMe(meJson.user);

      const res = await fetch('/api/portal/portfolio/list', { cache: 'no-store' });
      const json = (await res.json().catch(() => null)) as ListResponse | null;
      if (!res.ok || !json?.ok) {
        const msg = '載入列表失敗';
        setError(msg);
        setToast({ type: 'error', message: msg });
        setLoading(false);
        return;
      }
      setItems(Array.isArray(json.items) ? json.items : []);
      setLoading(false);
    })();
  }, []);

  const isAdmin = useMemo(() => me?.role === 'admin', [me?.role]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div className="space-y-6">
      {toast ? (
        <div className="fixed right-4 top-20 z-50">
          <div
            className={`rounded-xl border px-4 py-2 text-sm shadow-lg backdrop-blur ${toast.type === 'success'
              ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-100'
              : 'border-rose-400/30 bg-rose-500/15 text-rose-100'}`}
          >
            {toast.message}
          </div>
        </div>
      ) : null}
      <div className="rounded-2xl border border-white/10 bg-black/30 p-6 backdrop-blur">
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <p className="mt-2 text-white/70">
          {me ? (
            <>
              目前登入：<span className="text-white">{me.username}</span>（{me.role}）
            </>
          ) : (
            <>未登入</>
          )}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/portal/submit?new=1" className="rounded-full bg-white/10 px-4 py-2 text-sm hover:bg-white/15">
            新增一筆送審
          </Link>
          <Link href="/portal/submit" className="rounded-full bg-white/10 px-4 py-2 text-sm hover:bg-white/15">
            編輯最新一筆
          </Link>
          {isAdmin && (
            <Link href="/portal/admin" className="rounded-full bg-white/10 px-4 py-2 text-sm hover:bg-white/15">
              Admin panel
            </Link>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/20 p-6 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">我的送審紀錄</h3>
          <button
            className="rounded-full bg-white/10 px-4 py-2 text-sm hover:bg-white/15 disabled:opacity-60"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              const res = await fetch('/api/portal/portfolio/list', { cache: 'no-store' });
              const json = (await res.json().catch(() => null)) as ListResponse | null;
              if (res.ok && json?.ok) {
                setItems(Array.isArray(json.items) ? json.items : []);
                setToast({ type: 'success', message: '列表已更新' });
              } else {
                const msg = '重新整理失敗';
                setError(msg);
                setToast({ type: 'error', message: msg });
              }
              setLoading(false);
            }}
          >
            {loading ? '刷新中…' : '重新整理'}
          </button>
        </div>

        {error ? (
          <div className="mt-3 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((it) => {
            const key = it.documentId || String(it.id);
            const b = badge(it.status, it.publishedAt);
            return (
              <div key={key} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">{it.event_name || `#${key}`}</div>
                    <div className="mt-1 text-xs text-white/50">
                      {it.completion_date || ''}{it.event_location ? ` · ${it.event_location}` : ''}
                    </div>
                  </div>
                  <div className={`shrink-0 rounded-full border px-3 py-1 text-xs ${b.cls}`}>{b.text}</div>
                </div>

                {it.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.coverUrl} alt="cover" className="mt-3 h-32 w-full rounded-xl object-cover" />
                ) : null}

                {it.galleryUrls?.length ? (
                  <div className="mt-2 flex gap-2 overflow-x-auto">
                    {it.galleryUrls.slice(0, 6).map((u) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={u} src={u} alt="gallery" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
                    ))}
                  </div>
                ) : null}

                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href={`/portal/submit?id=${encodeURIComponent(key)}`} className="rounded-full bg-white/10 px-4 py-2 text-sm hover:bg-white/15">
                    編輯
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-semibold text-white/90">使用說明</h4>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-white/70">
            <li>
              「新增一筆送審」會建立新資料，不會覆蓋舊的 pending。
            </li>
            <li>
              「已拒絕」的案件可以點「編輯」進去修改，欄位會保留，送出後會重新回到 pending。
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
