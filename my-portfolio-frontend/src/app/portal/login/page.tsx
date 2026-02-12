'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function PortalLoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get('next') || '/portal/dashboard';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-black/30 p-6 backdrop-blur">
      <h2 className="text-xl font-semibold">Portal Login</h2>
      <p className="mt-1 text-sm text-white/60">
        Dev stub auth. Use any username/password. Username &quot;admin&quot; gets admin role.
      </p>

      <form
        className="mt-6 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          setError(null);
          try {
            const res = await fetch('/api/portal/login', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
              const data = await res.json().catch(() => null);
              throw new Error(data?.error || 'Login failed');
            }

            router.push(next);
            router.refresh();
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Login failed';
            setError(message);
          } finally {
            setLoading(false);
          }
        }}
      >
        <div>
          <label className="text-sm text-white/80">Username</label>
          <input
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-white/30"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. admin"
            autoComplete="username"
          />
        </div>

        <div>
          <label className="text-sm text-white/80">Password</label>
          <input
            type="password"
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-white/30"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        {error && <div className="text-sm text-red-300">{error}</div>}

        <button
          disabled={loading}
          className="w-full rounded-xl bg-white/15 px-4 py-2 font-medium hover:bg-white/20 disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
