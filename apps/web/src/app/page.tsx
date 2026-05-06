'use client';

import { useState } from 'react';

type PageState =
  | { kind: 'form' }
  | { kind: 'submitting' }
  | { kind: 'success' }
  | { kind: 'duplicate' }
  | { kind: 'error'; message: string }
  | { kind: 'rate_limited' };

export default function Home() {
  const [state, setState] = useState<PageState>({ kind: 'form' });
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; name?: string }>({});

  function validate(): boolean {
    const errors: { email?: string; name?: string } = {};
    if (!email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      errors.email = 'Please enter a valid email';
    if (!name.trim()) errors.name = 'Name is required';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setState({ kind: 'submitting' });

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), name: name.trim() }),
      });

      if (res.status === 201) {
        setState({ kind: 'success' });
        return;
      }

      if (res.status === 409) {
        setState({ kind: 'duplicate' });
        return;
      }

      if (res.status === 429) {
        setState({ kind: 'rate_limited' });
        return;
      }

      const data = await res.json().catch(() => null);
      setState({
        kind: 'error',
        message: data?.message ?? 'Something went wrong. Please try again.',
      });
    } catch {
      setState({
        kind: 'error',
        message: 'Network error. Please check your connection and try again.',
      });
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black px-6">
      <div className="w-full max-w-md text-center">
        <h1 className="text-5xl font-bold tracking-tight text-white">LaunchPad</h1>
        <p className="mt-4 text-lg text-gray-400">
          Be the first to know when we launch. Join the waitlist.
        </p>

        <div className="mt-4 flex flex-wrap justify-center gap-3 text-sm text-gray-500">
          <span>&bull; Early access</span>
          <span>&bull; Exclusive updates</span>
          <span>&bull; Launch discount</span>
        </div>

        {state.kind === 'success' ? (
          <div className="mt-10 rounded-lg border border-green-800 bg-green-900/30 p-6">
            <p className="text-lg font-medium text-green-400">You&apos;re on the list!</p>
            <p className="mt-1 text-sm text-green-600/80">
              We&apos;ll let you know when we launch.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 space-y-4 text-left">
            {state.kind === 'duplicate' && (
              <p className="rounded-lg border border-green-800 bg-green-900/30 px-4 py-3 text-center text-sm text-green-400">
                You&apos;re already on the list!
              </p>
            )}

            {state.kind === 'rate_limited' && (
              <p className="rounded-lg border border-amber-700 bg-amber-900/30 px-4 py-3 text-center text-sm text-amber-400">
                Too many requests. Please try again later.
              </p>
            )}

            {state.kind === 'error' && (
              <p className="rounded-lg border border-red-800 bg-red-900/30 px-4 py-3 text-center text-sm text-red-400">
                {state.message}
              </p>
            )}

            <div>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={state.kind === 'submitting'}
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none disabled:opacity-50"
              />
              {fieldErrors.name && <p className="mt-1 text-xs text-red-400">{fieldErrors.name}</p>}
            </div>

            <div>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={state.kind === 'submitting'}
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none disabled:opacity-50"
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={state.kind === 'submitting'}
              className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {state.kind === 'submitting' ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Joining…
                </>
              ) : (
                'Join the waitlist'
              )}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
