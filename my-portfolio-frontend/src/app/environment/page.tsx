import Image from 'next/image';
import { getEnvironments, API_BASE } from '@/lib/api';

export default async function EnvironmentPage() {
  const items = await getEnvironments();

  return (
    <main className="p-8 max-w-screen-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">環境介紹</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.map((item: any) => {
          const { id, title, photo } = item;
          // 直接從 photo.formats.small 拿縮圖，沒小圖就用原圖
          const url =
            photo?.formats?.small?.url ||
            photo?.url ||
            '';

          return (
            <div
              key={id}
              className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition"
            >
              {url ? (
                <Image
                  src={`${API_BASE}${url}`}
                  alt={title}
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  無圖片
                </div>
              )}
              <div className="p-4 text-center">
                <p className="text-lg font-medium">{title}</p>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
