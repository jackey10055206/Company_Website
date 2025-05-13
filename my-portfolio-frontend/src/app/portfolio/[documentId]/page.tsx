'use client';
import Image from 'next/image';
import { getPortfolio, PortfolioItem } from '@/lib/api';
import React,{useState, useEffect} from 'react';

interface Params {
  params: Promise<{ documentId: string }>;
}

export default function PortfolioDetailPage({ params }: Params) {
  // 使用解構提取 documentId
  const actualParams = React.use(params)
  const [documentId , setDocumentId] = useState<string | null>(null);
  const [item, setItem] = useState<PortfolioItem | null>(null);
  // const item: PortfolioItem = await getPortfolio(documentId);
  const [selectedImageIndex , setSelectedImageIndex] = useState<number | null>(null);
  const [isModelOpen, SetisModelOpen] = useState(false);

  useEffect(() => {
    if(actualParams?.documentId){
      setDocumentId(actualParams.documentId);
    }
  }, [params]);

  useEffect(() => {
    const fetchData = async() => {
      if(documentId){
        const portfolioItem = await getPortfolio(documentId);
        setItem(portfolioItem)
      }
    };
    fetchData();
  },[documentId])

  if (!item){
    return <div>找不到該項目</div>;
  }
  //打開圖片
  const openModel = (index: number) =>{
    setSelectedImageIndex(index);
    SetisModelOpen(true);
  };
  //關閉圖片
  const closeModel = () =>{
    SetisModelOpen(false);
  };

  //切換圖片
  const goToNextImage = () => {
    if (selectedImageIndex !== null && item.galleryUrls && item.galleryUrls?.length > 0) {
      setSelectedImageIndex((prevIndex) => {
        if (prevIndex === null || !item.galleryUrls) return 0;
        return (prevIndex + 1) % item.galleryUrls.length;
      });
    }
  };

  const goToPrevImage = () => {
    if (selectedImageIndex !== null && item.galleryUrls?.length && item.galleryUrls.length > 0) {
      setSelectedImageIndex((prevIndex) => {
        if (prevIndex === null || !item.galleryUrls) return 0;
        return (prevIndex - 1 + item.galleryUrls.length) % item.galleryUrls.length;
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      {/* 標題 + 活動資訊 */}
      <h1 className="text-4xl font-bold">{item.title}</h1>
      <div className="flex flex-wrap items-center text-gray-600 space-x-2">
        <span>{item.event_name}</span>
        <span>•</span>
        <span>{item.completion_date}</span>
        <span>•</span>
        <span>{item.event_location}</span>
      </div>

      {/* 大封面圖 */}
      {item.coverUrl && (
        <div className="w-full h-[400px] relative rounded-lg overflow-hidden shadow-lg">
          <Image
            src={item.coverUrl}
            alt={item.event_name}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}

      {/* 描述文字 */}
      {Array.isArray(item.description) && (
        <div className="prose max-w-none">
          {item.description.map((block: any, idx: number) => {
            const text = block.children.map((c: any) => c.text).join('');
            return <p key={idx}>{text}</p>;
          })}
        </div>
      )}

      {/* Gallery 多張圖片 */}
      {item.galleryUrls && item.galleryUrls.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {item.galleryUrls.map((image: any, idx: number) => (
            <div
              key={idx}
              className="aspect-w-4 aspect-h-3 relative rounded-lg overflow-hidden shadow-sm"
              onClick={() => openModel(idx)}
            >
              <Image
                src={`http://localhost:1337${image}`}
                alt={`${item.event_name} 圖片 ${idx + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ))}
        </div>
      )}
      {/* Modal 來顯示放大的圖片 */}
      {isModelOpen && selectedImageIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative">
            <button
              onClick={closeModel}
              className="absolute top-4 right-4 text-white text-2xl"
            >
              &times;
            </button>
            <Image
              src={`http://localhost:1337${item.galleryUrls?.[selectedImageIndex]}`}
              alt={`放大圖 ${selectedImageIndex + 1}`}
              width={1000}
              height={800}
              className="object-contain"
            />
            {/* 左右切換圖片 */}
            <button
              onClick={goToPrevImage}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 text-white text-4xl"
            >
              &#60;
            </button>
            <button
              onClick={goToNextImage}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 text-white text-4xl"
            >
              &#62;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}