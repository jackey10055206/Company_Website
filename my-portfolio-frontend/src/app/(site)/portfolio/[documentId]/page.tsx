'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import Image from 'next/image';
import { getPortfolio, type PortfolioItem } from '@/lib/api';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Params {
  params: Promise<{ documentId: string }>;
}

export default function PortfolioDetailPage({ params }: Params) {
  const actualParams = React.use(params);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [item, setItem] = useState<PortfolioItem | null>(null);

  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (actualParams?.documentId) {
      setDocumentId(actualParams.documentId);
    }
  }, [actualParams]);

  useEffect(() => {
    const fetchData = async () => {
      if (documentId) {
        const portfolioItem = await getPortfolio(documentId);
        setItem(portfolioItem);
      }
    };
    fetchData();
  }, [documentId]);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openModal = (index: number) => {
    setSelectedImageIndex(index);
    setIsModalOpen(true);
  };

  const goToNextImage = () => {
    if (selectedImageIndex !== null && item?.galleryUrls?.length) {
      setSelectedImageIndex((prevIndex) => {
        if (prevIndex === null) return 0;
        return (prevIndex + 1) % item.galleryUrls!.length;
      });
    }
  };

  const goToPrevImage = () => {
    if (selectedImageIndex !== null && item?.galleryUrls?.length) {
      setSelectedImageIndex((prevIndex) => {
        if (prevIndex === null) return 0;
        return (prevIndex - 1 + item.galleryUrls!.length) % item.galleryUrls!.length;
      });
    }
  };

  // ESC close + arrows navigate
  useEffect(() => {
    if (!isModalOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') goToPrevImage();
      if (e.key === 'ArrowRight') goToNextImage();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isModalOpen, selectedImageIndex, item?.galleryUrls?.length]);

  if (!item) {
    return <div className="max-w-4xl mx-auto p-8 text-white">找不到該項目</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8 text-white">
      {/* 標題 + 活動資訊 */}
      <h1 className="text-4xl font-bold">{item.title}</h1>
      <div className="flex flex-wrap items-center text-white/70 space-x-2">
        <span>{item.event_name}</span>
        <span>•</span>
        <span>{item.completion_date}</span>
        <span>•</span>
        <span>{item.event_location}</span>
      </div>

      {/* 大封面圖 */}
      {item.coverUrl && (
        <div className="w-full h-[400px] relative rounded-xl overflow-hidden shadow-lg shadow-black/30 ring-1 ring-white/10">
          <Image src={item.coverUrl} alt={item.event_name} fill className="object-cover" unoptimized />
        </div>
      )}

      {/* 描述文字：白色玻璃底 */}
      {Array.isArray(item.description) && item.description.length > 0 && (
        <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md shadow-lg shadow-black/20 p-6">
          <div className="prose prose-invert max-w-none prose-p:leading-7 prose-p:text-white/90">
            {item.description.map((block: any, idx: number) => {
              const text = block.children.map((c: any) => c.text).join('');
              return <p key={idx}>{text}</p>;
            })}
          </div>
        </div>
      )}

      {/* Gallery 多張圖片 */}
      {item.galleryUrls && item.galleryUrls.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {item.galleryUrls.map((image: any, idx: number) => (
            <button
              type="button"
              key={idx}
              className="aspect-w-4 aspect-h-3 relative rounded-xl overflow-hidden shadow-sm ring-1 ring-white/10 hover:ring-white/20 transition"
              onClick={() => openModal(idx)}
            >
              <Image src={String(image)} alt={`${item.event_name} 圖片 ${idx + 1}`} fill className="object-cover" unoptimized />
            </button>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && selectedImageIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* close */}
            <button
              type="button"
              onClick={closeModal}
              className="absolute -top-3 -right-3 md:top-2 md:right-2 z-10 inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/10 backdrop-blur-md ring-1 ring-white/20 text-white hover:bg-white/15 hover:ring-white/30 transition"
              aria-label="關閉"
            >
              <X className="w-6 h-6" />
            </button>

            {/* image */}
            <div className="relative rounded-2xl overflow-hidden ring-1 ring-white/15 shadow-2xl shadow-black/40 bg-black/20">
              <Image
                src={String(item.galleryUrls?.[selectedImageIndex] ?? '')}
                alt={`放大圖 ${selectedImageIndex + 1}`}
                width={1600}
                height={1000}
                className="w-full h-auto object-contain"
                unoptimized
              />
            </div>

            {/* prev/next */}
            <button
              type="button"
              onClick={goToPrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/10 backdrop-blur-md ring-1 ring-white/20 text-white hover:bg-white/15 hover:ring-white/30 transition"
              aria-label="上一張"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>
            <button
              type="button"
              onClick={goToNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/10 backdrop-blur-md ring-1 ring-white/20 text-white hover:bg-white/15 hover:ring-white/30 transition"
              aria-label="下一張"
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
