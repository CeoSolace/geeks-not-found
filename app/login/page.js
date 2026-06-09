export default function LoginPage({ searchParams }) {
  const error = searchParams?.error ? String(searchParams.error) : '';

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 text-slate-950">
      <form
        method="POST"
        action="/api/auth/login"
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
      >
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-widest text-blue-600">
            Founder Access
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">
            ProperGeeks Login
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Enter the username from F_LOGIN.
          </p>
        </div>

        {error && (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">
            {decodeURIComponent(error)}
          </p>
        )}

        <label className="mb-5 block">
          <span className="mb-1 block text-sm font-bold text-slate-800">
            Username
          </span>
          <input
            name="username"
            type="text"
            autoComplete="username"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-950 outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-xl bg-blue-600 py-3 font-black text-white hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </main>
  );
}