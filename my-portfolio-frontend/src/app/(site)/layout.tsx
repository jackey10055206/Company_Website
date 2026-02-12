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
        <h1 className="text-2xl font-bold text-center md:text-left">
          <Link href="/">我們公司的 LOGO</Link>
        </h1>
        <TopNav />
      </header>
      {children}
    </>
  );
}
