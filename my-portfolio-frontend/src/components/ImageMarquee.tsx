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
        'w-full overflow-hidden rounded-2xl ' +
        'bg-black/15 backdrop-blur-sm ring-1 ring-white/10 ' +
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
              'relative h-full flex items-center justify-center ' +
              // Fixed slide width keeps spacing consistent.
              'w-[260px] md:w-[340px] ' +
              'px-6'
            }
          >
            <div className="relative w-full h-[70%]">
              <Image
                src={it.src}
                alt={it.alt}
                fill
                className="object-contain"
                // local public assets; keep it simple
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
