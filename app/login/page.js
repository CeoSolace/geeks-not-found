export default function LoginPage({ searchParams }) {
  const error = searchParams?.error || '';
  const message = searchParams?.message || '';

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 text-slate-950">
      <form method="POST" action="/api/auth/login" className="bg-white p-6 rounded-xl shadow w-full max-w-sm border border-gray-200">
        <h1 className="text-2xl font-bold mb-1 text-slate-950">ProperGeeks Login</h1>
        <p className="text-sm text-gray-600 mb-4">Use the Render env login credentials.</p>

        {error && <p className="text-red-700 bg-red-50 border border-red-200 rounded p-2 mb-3 text-sm font-semibold">{decodeURIComponent(error)}</p>}
        {message && <p className="text-blue-700 bg-blue-50 border border-blue-200 rounded p-2 mb-3 text-sm font-semibold">{decodeURIComponent(message)}</p>}

        <div className="mb-4">
          <label className="block mb-1 font-medium text-slate-800" htmlFor="username">F_LOGIN</label>
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
          <label className="block mb-1 font-medium text-slate-800" htmlFor="password">F_PASSWORD</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            className="w-full border border-slate-300 rounded px-3 py-2 text-slate-950 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-bold">
          Login → Dashboard
        </button>
      </form>
    </main>
  );
}
