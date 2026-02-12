// src/app/portal/layout.tsx
import Link from 'next/link';
import { getPortalUserFromCookies } from '@/lib/portalAuth';
import PortalLogoutButton from './logout-button';

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await getPortalUserFromCookies();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/30 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/portal/dashboard" className="text-lg font-semibold">
              Upload Portal
            </Link>
            {user && (
              <span className="text-sm text-white/60">
                {user.username} ({user.role})
              </span>
            )}
          </div>

          {user ? (
            <PortalLogoutButton />
          ) : (
            <Link href="/portal/login" className="text-sm text-white/80 hover:text-white">
              Login
            </Link>
          )}
        </div>

        <nav className="mx-auto max-w-5xl px-4 pb-3">
          <div className="flex flex-wrap gap-2 text-sm">
            <Link
              href="/portal/dashboard"
              className="rounded-full bg-white/10 px-3 py-1 text-white/90 hover:bg-white/15"
            >
              Dashboard
            </Link>
            <Link
              href="/portal/submit"
              className="rounded-full bg-white/10 px-3 py-1 text-white/90 hover:bg-white/15"
            >
              Submit
            </Link>
            {user?.role === 'admin' && (
              <Link
                href="/portal/admin"
                className="rounded-full bg-white/10 px-3 py-1 text-white/90 hover:bg-white/15"
              >
                Admin
              </Link>
            )}
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
