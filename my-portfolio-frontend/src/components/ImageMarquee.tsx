'use client';

import Image from 'next/image';
import React from 'react';

export type ImageMarqueeItem = {
  src: string;
  alt: string;
};

export default function ImageMarquee({
  items,
  seconds = 20,
  heightClassName = 'h-24 md:h-32',
}: {
  items: ImageMarqueeItem[];
  /** seconds for one full loop */
  seconds?: number;
  /** tailwind height classes applied to the marquee strip */
  heightClassName?: string;
}) {
  // Duplicate to make a seamless loop
  const loopItems = [...items, ...items];

  return (
    <section
      aria-label="圖片跑馬燈"
      className={
        'w-full overflow-hidden ' +
        // full-width strip (no "card" look)
        'bg-black/10 backdrop-blur-sm border-b border-white/10 ' +
        heightClassName
      }
    >
      {/*
        Track scrolls L→R (translateX from -50% to 0)
        - content is duplicated, so when it reaches 0 it looks continuous.
        - pause on hover is helpful on desktop.
      */}
      <div
        className="marquee-track h-full flex items-center"
        style={{ ['--marquee-seconds' as unknown as string]: `${seconds}s` } as React.CSSProperties}
      >
        {loopItems.map((it, idx) => (
          <div
            key={`${it.src}-${idx}`}
            className={
              'relative h-full flex items-center justify-center flex-none ' +
              // Keep each image touching the next (tiny gap only)
              'w-[360px] md:w-[640px]'
            }
          >
            <div className="relative w-full h-full">
              <Image
                src={it.src}
                alt={it.alt}
                fill
                className="object-contain"
                unoptimized
                priority={idx < items.length}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
