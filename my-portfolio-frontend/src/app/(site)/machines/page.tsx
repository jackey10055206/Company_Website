import Image from 'next/image';
import Link from 'next/link';
import { getMachines } from '@/lib/api';
import FadeInOnView from '@/components/FadeInOnView';

export const dynamic = 'force-dynamic';

type MachineItem = {
  id: number;
  documentId?: string;
  title: string;
  description?: string;
  photo?: {
    formats?: { small?: { url?: string } };
    url?: string;
  };
};

export default async function MachinesPage() {
  let items: MachineItem[] = [];
  let errorMsg = '';

  try {
    items = await getMachines();
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : String(err);
  }

  return (
    <main className="max-w-screen-xl mx-auto px-6 pt-10 md:pt-12 pb-12 text-white">
      <h1 className="text-3xl font-bold mb-6 text-center">機器介紹</h1>
      {errorMsg ? (
        <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-red-100">
          <p className="font-semibold">Strapi 連線失敗 / API 尚未建立</p>
          <p className="text-sm opacity-90 break-words">{errorMsg}</p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.map((item, idx) => {
          const { id, title, photo } = item;
          const url = photo?.formats?.small?.url || photo?.url || '';
          const src = url
            ? (url.startsWith('http://') || url.startsWith('https://') ? url : url)
            : '';

          return (
            <FadeInOnView
              key={id}
              delay={(idx % 12) * 0.05}
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              className="rounded-xl overflow-hidden border border-white/20 bg-white/10 backdrop-blur-md shadow-lg shadow-black/30 hover:border-white/30 hover:bg-white/15 hover:shadow-xl"
            >
              <Link
                href={`/machines/${item.documentId ?? id}`}
                className="block"
              >
              {src ? (
                <Image
                  src={src}
                  alt={title}
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-700">
                  無圖片
                </div>
              )}
              <div className="p-4 text-center border-t border-white/15">
                <p className="text-lg font-medium">{title}</p>
              </div>
              </Link>
            </FadeInOnView>
          );
        })}
      </div>
    </main>
  );
}
