import Image from 'next/image';
import Link from 'next/link';
import { getMachine, API_BASE } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function MachineDetailPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;
  const item = await getMachine(documentId);
  const url = item.photo?.formats?.small?.url || item.photo?.url || '';
  const src = url ? (url.startsWith('/') ? `${API_BASE}${url}` : url) : '';

  return (
    <main className="max-w-4xl mx-auto px-6 pt-10 md:pt-12 pb-12 text-white space-y-6">
      <div>
        <Link href="/machines" className="text-white/70 hover:text-white underline underline-offset-4">
          ← 回到機器列表
        </Link>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold">{item.title}</h1>

      {src ? (
        <div className="w-full h-[360px] relative rounded-2xl overflow-hidden shadow-lg shadow-black/30 ring-1 ring-white/10">
          <Image src={src} alt={item.title} fill className="object-cover" unoptimized />
        </div>
      ) : null}

      {item.description ? (
        <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md shadow-lg shadow-black/20 p-6">
          <p className="text-white/90 leading-7 whitespace-pre-line">{item.description}</p>
        </div>
      ) : null}
    </main>
  );
}
