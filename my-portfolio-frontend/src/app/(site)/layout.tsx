// src/app/(site)/layout.tsx
import Link from 'next/link';
import TopNav from '@/components/TopNav';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header
        className="absolute top-0 left-0 w-full z-20 px-6 py-4
                   flex flex-col items-center gap-2
                   md:flex-row md:items-center md:justify-between"
      >
        <Link
          href="/"
          className="inline-flex items-center justify-center md:justify-start"
          aria-label="回到首頁"
        >
          {/* Add subtle glass plate + stronger glow to increase contrast on dark gradients */}
          <span className="inline-flex items-center rounded-xl bg-white/10 px-3 py-2 backdrop-blur-sm ring-1 ring-white/15">
            {/* Use <img> for SVG to avoid next/image SVG restrictions/optimization */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo.svg"
              alt="公司 Logo"
              className="h-14 w-auto md:h-24 drop-shadow-[0_4px_18px_rgba(255,255,255,0.9)]"
            />
          </span>
        </Link>

        <TopNav />
      </header>
      {children}
    </>
  );
}
