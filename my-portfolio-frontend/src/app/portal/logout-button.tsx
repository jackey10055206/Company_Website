'use client';

import { useRouter } from 'next/navigation';

export default function PortalLogoutButton() {
  const router = useRouter();

  return (
    <button
      className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/90 hover:bg-white/15"
      onClick={async () => {
        await fetch('/api/portal/logout', { method: 'POST' });
        router.push('/portal/login');
        router.refresh();
      }}
    >
      Logout
    </button>
  );
}
