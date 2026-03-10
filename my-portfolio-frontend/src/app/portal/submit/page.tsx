'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

// (legacy Strapi typing removed; submit page now loads via /api/portal/portfolio/list)

const MAX_MB = 8;

export default function PortalSubmitPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const [eventName, setEventName] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [description, setDescription] = useState('');
  // NOTE: Strapi portfolio model currently has no separate "note" field.
  // We merge note into description when submitting.
  const [note, setNote] = useState('');

  const [cover, setCover] = useState<File | null>(null);
  const [gallery, setGallery] = useState<File[]>([]);
  const [existingId, setExistingId] = useState<string>('');
  const [existingStatus, setExistingStatus] = useState<string>('');
  const [result, setResult] = useState<unknown>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [me, setMe] = useState<{ ok: true; user: { username: string; role: string } } | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/portal/me', { cache: 'no-store' });
      const j = (await res.json().catch(() => null)) as unknown;
      if (res.ok && j && typeof j === 'object' && (j as { ok?: unknown }).ok) {
        setMe(j as { ok: true; user: { username: string; role: string } });
      }
    })();
  }, []);

  const totalSizeMb = useMemo(() => {
    const bytes = (cover?.size || 0) + gallery.reduce((sum, f) => sum + f.size, 0);
    return Math.round((bytes / 1024 / 1024) * 10) / 10;
  }, [cover, gallery]);

  useEffect(() => {
    (async () => {
      setError(null);
      setSuccess(null);

      const requestedId = (sp.get('id') || '').trim();
      const forceNew = sp.get('new') === '1';

      // If explicitly creating new, don't prefill.
      if (forceNew) {
        setExistingId('');
        setExistingStatus('');
        return;
      }

      const res = await fetch('/api/portal/portfolio/list', { cache: 'no-store' });
      const json = (await res.json().catch(() => null)) as unknown;
      const obj = json && typeof json === 'object' ? (json as Record<string, unknown>) : null;
      if (!res.ok || !obj?.ok) return;

      const itemsRaw = Array.isArray(obj.items) ? obj.items : [];
      const items = itemsRaw.filter((x): x is Record<string, unknown> => !!x && typeof x === 'object');

      const pick = requestedId
        ? items.find((x) => (x.documentId || String(x.id)) === requestedId)
        : items[0];

      if (!pick) return;

      const key = (typeof pick.documentId === 'string' ? pick.documentId : '') || (typeof pick.id === 'number' ? String(pick.id) : '');
      if (!key) return;

      setExistingId(key);
      if (typeof pick?.status === 'string') setExistingStatus(pick.status);

      // Prefill
      if (typeof pick?.event_name === 'string') setEventName(pick.event_name);
      if (typeof pick?.completion_date === 'string') setCompletionDate(pick.completion_date);
      if (typeof pick?.event_location === 'string') setEventLocation(pick.event_location);
      if (typeof pick?.description === 'string') setDescription(pick.description);
      // note currently not persisted; keep local only.
    })();
  }, [sp]);

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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold">
            上傳案例（{me?.user?.role === 'admin' ? '直接發布' : '送審'}）
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-full bg-white/10 px-4 py-2 text-sm hover:bg-white/15"
              onClick={() => {
                // Clear state and switch URL.
                setExistingId('');
                setExistingStatus('');
                setEventName('');
                setCompletionDate('');
                setEventLocation('');
                setDescription('');
                setNote('');
                setCover(null);
                setGallery([]);
                router.replace('/portal/submit?new=1');
              }}
            >
              新增一筆（不覆蓋）
            </button>
          </div>
        </div>
        <p className="mt-2 text-sm text-white/60">
          {me?.user?.role === 'admin' ? (
            <>
              你目前是 <code>admin</code>：送出後會直接設為 <code>approved</code> 並立即上架（不需要到 <code>/portal/admin</code> 再按 Approve）。
            </>
          ) : (
            <>
              你目前是 <code>uploader</code>：送出後案件會進入 <code>pending</code>，請 admin 到 <code>/portal/admin</code> 審核。
            </>
          )}
        </p>
        <p className="mt-2 text-sm text-white/60">
          檔案與資料會由伺服器端代打寫入 Strapi（<code>/api/portal/portfolio/submit</code>）。
        </p>
        {existingId && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-white/50">
              Editing existing item: <code>#{existingId}</code>
              {existingStatus ? (
                <>
                  {' '}· status: <code>{existingStatus}</code>
                </>
              ) : null}
            </p>

            {existingStatus === 'pending' ? (
              <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
                目前狀態：審核中（pending）
              </div>
            ) : null}

            {existingStatus === 'approved' ? (
              <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
                目前狀態：已通過（approved）
              </div>
            ) : null}

            {existingStatus === 'rejected' ? (
              <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
                目前狀態：未通過（rejected）。請修改內容後再送審。
              </div>
            ) : null}
          </div>
        )}

        <form
          className="mt-6 space-y-4"
          action="/api/portal/portfolio/submit"
          method="post"
          encType="multipart/form-data"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setError(null);
            setSuccess(null);
            setResult(null);

            try {
              const fd = new FormData();
              if (cover) fd.set('cover', cover);
              for (const f of gallery) fd.append('gallery', f);

              fd.set('event_name', eventName);
              fd.set('completion_date', completionDate);
              fd.set('event_location', eventLocation);
              fd.set('description', description);
              fd.set('note', note);

              if (existingId) fd.set('portfolioId', existingId);

              const res = await fetch('/api/portal/portfolio/submit', {
                method: 'POST',
                body: fd,
              });

              const rawText = await res.text().catch(() => '');
              let data: unknown = null;
              try {
                data = rawText ? (JSON.parse(rawText) as unknown) : null;
              } catch {
                data = null;
              }

              const obj = data && typeof data === 'object' ? (data as Record<string, unknown>) : null;

              if (!res.ok) {
                const hint = rawText && !obj ? rawText.slice(0, 160) : '';
                const errMsg = obj && typeof obj.error === 'string' ? obj.error : null;
                throw new Error(errMsg || `Submit failed (${res.status})${hint ? `: ${hint}` : ''}`);
              }

              setResult(data);

              const portfolio = obj?.portfolio as Record<string, unknown> | undefined;
              const attrs = (portfolio?.attributes as Record<string, unknown> | undefined) ?? undefined;
              const documentId = (portfolio?.documentId as unknown) ?? (attrs?.documentId as unknown);
              const id = portfolio?.id;
              const status = (attrs?.status ?? attrs?.review_status) as unknown;

              // Prefer documentId for subsequent updates (Strapi v5)
              if (typeof documentId === 'string' && documentId) setExistingId(documentId);
              else if (typeof id === 'number' || typeof id === 'string') setExistingId(String(id));

              if (typeof status === 'string') setExistingStatus(status);
              const okMsg = me?.user?.role === 'admin'
                ? '已送出成功（直接發布 / approved）。'
                : '已送出成功（已送審 / pending）。';
              setSuccess(okMsg);
              setToast({ type: 'success', message: okMsg });
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : 'Submit failed';
              setError(message);
              setToast({ type: 'error', message });
            } finally {
              setLoading(false);
            }
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-white/80">標題（會存到 event_name）</label>
              <input
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-white/30"
                placeholder="例如：春酒舞台背板｜XX 品牌"
              />
            </div>

            <div>
              <label className="text-sm text-white/80">完成日期</label>
              <input
                type="date"
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-white/30"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm text-white/80">地點</label>
              <input
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-white/30"
                placeholder="例如：台北／南港展覽館"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm text-white/80">Description（可選）</label>
              <textarea
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-white/30"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="可不填；若要填，建議用條列描述特色/材質/尺寸…"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-white/80">
              封面圖 {existingId ? '（更新可不選）' : '（必填）'}
            </label>
            <input
              type="file"
              accept="image/*"
              className="mt-1 block w-full text-sm text-white/80 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white/90 hover:file:bg-white/15"
              onChange={(e) => setCover(e.target.files?.[0] ?? null)}
            />
            <p className="mt-1 text-xs text-white/50">Max {MAX_MB}MB, jpg/png/webp/gif.</p>
          </div>

          <div>
            <label className="text-sm text-white/80">相簿圖片（至少 1 張）</label>
            <input
              type="file"
              accept="image/*"
              multiple
              className="mt-1 block w-full text-sm text-white/80 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white/90 hover:file:bg-white/15"
              onChange={(e) => setGallery(Array.from(e.target.files || []))}
            />
            <p className="mt-1 text-xs text-white/50">Total selected: {totalSizeMb}MB</p>
          </div>

          <div>
            <label className="text-sm text-white/80">備註（可選）</label>
            <textarea
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-white/30"
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional description..."
            />
          </div>

          {success && (
            <div className="text-sm rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-emerald-100">
              {success}
            </div>
          )}

          {error && (
            <div className="text-sm rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-white/15 px-4 py-2 font-medium hover:bg-white/20 disabled:opacity-60"
          >
            {loading
              ? '送出中…'
              : me?.user?.role === 'admin'
                ? (existingId ? '更新並直接發布' : '直接發布')
                : (existingId
                  ? (existingStatus === 'rejected' ? '更新並重新送審' : '更新並送審')
                  : '送出審核')}
          </button>
          <p className="mt-2 text-xs text-white/50">
            提醒：送出成功後會顯示提示訊息；若你重複點擊，可能會重複送出。
          </p>
        </form>
      </div>

      {result !== null && (
        <pre className="overflow-auto rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-white/80">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
