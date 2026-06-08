"use client";

import { useState } from 'react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch (_) {}

      if (!res.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      if (data.mustChangePassword || data.redirectTo === '/change-password') {
        window.location.href = '/change-password';
        return;
      }

      window.location.href = data.redirectTo || '/dashboard';
    } catch (err) {
      setError('Could not connect to the login server. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow w-full max-w-sm border border-gray-200">
        <h1 className="text-2xl font-bold mb-1">ProperGeeks Login</h1>
        <p className="text-sm text-gray-600 mb-4">Sign in to the database system.</p>

        {error && <p className="text-red-600 bg-red-50 border border-red-200 rounded p-2 mb-3 text-sm">{error}</p>}

        <div className="mb-4">
          <label className="block mb-1 font-medium" htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>
    </main>
  );
}
