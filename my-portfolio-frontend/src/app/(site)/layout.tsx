// src/app/(site)/layout.tsx
import Image from 'next/image';
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
          <Image
            src="/brand/logo-v2.png"
            alt="公司 Logo"
            width={227}
            height={79}
            priority
            className="h-9 w-auto md:h-12"
          />
        </Link>

        <TopNav />
      </header>
      {children}
    </>
  );
}
