"use client";

import { useState } from 'react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectHard = (target) => {
    const safeTarget = target && target.startsWith('/') ? target : '/dashboard';
    setStatus(`Login accepted. Redirecting to ${safeTarget}...`);
    window.location.replace(safeTarget);

    setTimeout(() => {
      if (window.location.pathname !== safeTarget) {
        window.location.href = safeTarget;
      }
    }, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('Checking login...');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || 'Login failed');
        setStatus('');
        setLoading(false);
        return;
      }

      redirectHard(data.redirectTo || (data.mustChangePassword ? '/change-password' : '/dashboard'));
    } catch (err) {
      setError('Could not connect to the login server. Try again.');
      setStatus('');
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 text-slate-950">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow w-full max-w-sm border border-gray-200">
        <h1 className="text-2xl font-bold mb-1 text-slate-950">ProperGeeks Login</h1>
        <p className="text-sm text-gray-600 mb-4">Sign in to the database system.</p>

        {error && <p className="text-red-700 bg-red-50 border border-red-200 rounded p-2 mb-3 text-sm font-semibold">{error}</p>}
        {status && <p className="text-blue-700 bg-blue-50 border border-blue-200 rounded p-2 mb-3 text-sm font-semibold">{status}</p>}

        <div className="mb-4">
          <label className="block mb-1 font-medium text-slate-800" htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            className="w-full border border-slate-300 rounded px-3 py-2 text-slate-950 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium text-slate-800" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="w-full border border-slate-300 rounded px-3 py-2 text-slate-950 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60 font-bold"
        >
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>
    </main>
  );
}
