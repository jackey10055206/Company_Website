// src/app/layout.tsx
import Link from 'next/link';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body className="p-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold mb-4">
            <Link href="/">我們公司的 LOGO</Link>
          </h1>
          <nav className="space-x-4 ">
            <Link href="/">公司介紹</Link>
            <Link href="/environment">環境介紹</Link>
            <Link href="/machines">機器介紹</Link>
            <Link href="/portfolio">場佈展示</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
