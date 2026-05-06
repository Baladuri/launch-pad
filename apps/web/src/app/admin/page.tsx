'use client';

import { useCallback, useEffect, useState } from 'react';

type Entry = {
  id: number;
  email: string;
  name: string;
  createdAt: string;
};

type PageState =
  | { kind: 'loading' }
  | { kind: 'login' }
  | { kind: 'login_error'; message: string }
  | { kind: 'authenticated'; entries: Entry[] }
  | { kind: 'error'; message: string };

export default function AdminPage() {
  const [state, setState] = useState<PageState>({ kind: 'loading' });
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/waitlist');

      if (res.status === 401) {
        setState({ kind: 'login' });
        return;
      }

      if (!res.ok) {
        setState({ kind: 'error', message: 'Failed to load entries.' });
        return;
      }

      const data = await res.json();
      setState({ kind: 'authenticated', entries: data.entries });
    } catch {
      setState({ kind: 'error', message: 'Network error. Is the API server running?' });
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setState({ kind: 'login_error', message: data.message ?? 'Invalid password.' });
        setSubmitting(false);
        return;
      }

      setPassword('');
      await fetchEntries();
    } catch {
      setState({ kind: 'login_error', message: 'Network error. Is the API server running?' });
      setSubmitting(false);
    }
  }

  if (state.kind === 'loading') {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-700 border-t-white" />
        </div>
      </AdminLayout>
    );
  }

  if (state.kind === 'login' || state.kind === 'login_error') {
    return (
      <AdminLayout>
        <div className="mx-auto max-w-sm py-20">
          <h1 className="mb-2 text-2xl font-bold text-white">Admin</h1>
          <p className="mb-8 text-sm text-gray-400">Enter the admin password to continue.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              autoFocus
            />

            {state.kind === 'login_error' && (
              <p className="text-sm text-red-400">{state.message}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </AdminLayout>
    );
  }

  if (state.kind === 'error') {
    return (
      <AdminLayout>
        <div className="py-20 text-center">
          <p className="text-red-400">{state.message}</p>
          <button
            onClick={fetchEntries}
            className="mt-4 text-sm text-blue-400 underline hover:text-blue-300"
          >
            Try again
          </button>
        </div>
      </AdminLayout>
    );
  }

  const { entries } = state;

  return (
    <AdminLayout>
      <div className="mx-auto max-w-3xl py-12">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Waitlist</h1>

          <a
            href="/api/admin/waitlist/export"
            className="rounded-lg bg-gray-800 px-4 py-2 text-sm text-gray-300 transition hover:bg-gray-700"
          >
            Export CSV
          </a>
        </div>

        {entries.length === 0 ? (
          <div className="rounded-lg border border-gray-800 p-12 text-center">
            <p className="text-gray-400">No signups yet.</p>
            <p className="mt-1 text-sm text-gray-600">
              Share the landing page to get your first waitlist entry.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-800">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-800 bg-gray-900">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-400">Name</th>
                  <th className="px-4 py-3 font-medium text-gray-400">Email</th>
                  <th className="px-4 py-3 font-medium text-gray-400">Signed Up</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-900/50">
                    <td className="px-4 py-3 text-white">{entry.name}</td>
                    <td className="px-4 py-3 text-gray-300">{entry.email}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(entry.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {entries.length > 0 && (
          <p className="mt-4 text-xs text-gray-600">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'} total
          </p>
        )}
      </div>
    </AdminLayout>
  );
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-black px-6">{children}</main>
  );
}
