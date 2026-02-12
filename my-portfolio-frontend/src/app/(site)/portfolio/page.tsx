// src/app/portfolio/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { getPortfolios, PortfolioItem } from '@/lib/api';
import FadeInOnView from '@/components/FadeInOnView';

export const dynamic = 'force-dynamic';

export default async function PortfolioListPage() {
  let items: PortfolioItem[] = [];
  let errorMsg = '';

  try {
    items = await getPortfolios();
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : String(err);
  }

  return (
    <main className="max-w-screen-xl mx-auto px-6 pt-24 pb-12">
      <h1 className="text-3xl font-bold mb-6 text-center text-white">場佈展示</h1>
      {errorMsg ? (
        <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-red-100 mb-6">
          <p className="font-semibold">Strapi 連線失敗 / API 尚未建立</p>
          <p className="text-sm opacity-90 break-words">{errorMsg}</p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items
          .slice()
          .sort((a, b) => {
            // Keep frontend stable even if API sort isn't applied.
            const ad = a.completion_date ? Date.parse(a.completion_date) : 0;
            const bd = b.completion_date ? Date.parse(b.completion_date) : 0;
            return bd - ad;
          })
          .map((item) => {
          const key = item.documentId ?? String(item.id);
          const href = item.documentId ? `/portfolio/${String(item.documentId)}` : `/portfolio/${String(item.id)}`;
          const coverSrc = item.coverUrl ?? '';

          return (
            <FadeInOnView
              key={key}
              delay={(items.findIndex((x) => (x.documentId ?? String(x.id)) === key) % 12) * 0.05}
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              className="rounded-lg shadow-md overflow-hidden bg-white/90 hover:shadow-lg"
            >
              <Link href={href} className="block">
                <div className="aspect-w-16 aspect-h-9 relative bg-gray-100">
                  {coverSrc ? (
                    <Image
                      src={coverSrc}
                      alt={item.event_name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">無封面</div>
                  )}
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-semibold truncate text-gray-900">{item.event_name}</h3>
                  <p className="text-sm text-gray-600">{item.completion_date ?? ''}</p>
                </div>
              </Link>
            </FadeInOnView>
          );
        })}
      </div>
    </main>
  );
}
