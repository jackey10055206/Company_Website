// src/app/portfolio/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { getPortfolios, PortfolioItem } from '@/lib/api';

export default async function PortfolioListPage() {
  const items: PortfolioItem[] = await getPortfolios();
  console.log('Portfolios list items:', items);
  items.forEach(item => {
  console.log('Cover URL for item:', item.coverUrl);
  });


  return (
    <div className="grid grid-cols-3 gap-6 p-8">

      {items.map((item) => (
        // 1) 用 Link 包住整张卡片，並根據 documentId 跳轉
        <Link
          key={item.documentId}
          href={`/portfolio/${String(item.documentId)}`}
          className="block rounded-lg shadow-md overflow-hidden bg-white hover:shadow-lg transition"
        >
          
          {/* 2) 卡片内容保持不变 */}
          <div>
            <div className="aspect-w-16 aspect-h-9 relative bg-gray-100">
              {item.coverUrl ? (
                <Image
                  src={`http://localhost:1337${item.coverUrl}`}
                  alt={item.event_name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  無封面
                </div>
              )}
            </div>
            <div className="p-4 text-center">
              <h3 className="font-semibold truncate">{item.event_name}</h3>
              <p className="text-sm text-gray-600">{item.completion_date}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
