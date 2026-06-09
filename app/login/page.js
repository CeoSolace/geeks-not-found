"use client";

import { useState } from 'react';

function cleanPath(path) {
  if (!path || typeof path !== 'string') return '/dashboard';
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('://')) return '/dashboard';
  return path;
}

export default function LoginPage() {
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [nextPath, setNextPath] = useState('');
  const [loading, setLoading] = useState(false);

  function forceOpen(path) {
    const target = cleanPath(path);
    setNextPath(target);
    setStatus(`Login accepted. Opening ${target}...`);

    try {
      window.top.location.href = target;
    } catch (_) {
      window.location.href = target;
    }

    setTimeout(() => {
      try {
        window.top.location.assign(target);
      } catch (_) {
        window.location.assign(target);
      }
    }, 250);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setStatus('Checking login...');
    setNextPath('');
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const username = String(form.get('username') || '').trim();
    const password = String(form.get('password') || '');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        setError(data.message || 'Login failed');
        setStatus('');
        setLoading(false);
        return;
      }

      forceOpen(data.redirectTo || (data.mustChangePassword ? '/change-password' : '/dashboard'));
    } catch (err) {
      setError('Could not connect to the login server. Try again.');
      setStatus('');
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 text-slate-950">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow w-full max-w-sm border border-gray-200">
        <h1 className="text-2xl font-bold mb-1 text-slate-950">ProperGeeks Login</h1>
        <p className="text-sm text-gray-600 mb-4">Sign in to the database system.</p>

        {error && <p className="text-red-700 bg-red-50 border border-red-200 rounded p-2 mb-3 text-sm font-semibold">{error}</p>}
        {status && <p className="text-blue-700 bg-blue-50 border border-blue-200 rounded p-2 mb-3 text-sm font-semibold">{status}</p>}
        {nextPath && (
          <a href={nextPath} className="block text-center bg-slate-950 text-white rounded p-2 mb-3 text-sm font-bold">
            Open dashboard manually
          </a>
        )}

        <div className="mb-4">
          <label className="block mb-1 font-medium text-slate-800" htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            className="w-full border border-slate-300 rounded px-3 py-2 text-slate-950 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium text-slate-800" htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            className="w-full border border-slate-300 rounded px-3 py-2 text-slate-950 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60 font-bold">
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </main>
  );
}
