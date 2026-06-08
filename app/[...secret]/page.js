import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import DevControlPanel from '../../components/DevControlPanel';

function appBaseUrl() {
  return (process.env.APP_URL || 'https://geeks-not-found.onrender.com').replace(/\/$/, '');
}

function DevLoginPanel({ secretPath }) {
  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl border border-slate-200">
        <div className="h-12 w-12 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black mb-4">PG</div>
        <h1 className="text-2xl font-black mb-2">Developer Emergency Control</h1>
        <p className="text-slate-600 mb-6">This panel is hidden and protected. Enter the developer key to continue.</p>
        <form method="POST" action={`${appBaseUrl()}/api/dev-control/login`} className="space-y-4">
          <input type="hidden" name="route" value={secretPath} />
          <input type="password" name="key" placeholder="Developer Key" className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500" />
          <button type="submit" className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black">Unlock Control Panel</button>
        </form>
        <p className="mt-5 text-xs text-slate-500">Wrong keys redirect away. This page is not linked anywhere in the app.</p>
      </div>
    </main>
  );
}

export default function SecretRoutePage({ params }) {
  const slugArray = Array.isArray(params.secret) ? params.secret : [params.secret];
  const slug = slugArray.join('/');
  const secretPath = process.env.DEV_CONTROL_ROUTE;

  if (!secretPath) {
    return notFound();
  }

  if (slug === secretPath) {
    return <DevLoginPanel secretPath={secretPath} />;
  }

  if (slug === `${secretPath}/dashboard`) {
    const cookieStore = cookies();
    const token = cookieStore.get('devtoken');

    if (!token || token.value !== process.env.DEV_CONTROL_KEY) {
      return notFound();
    }

    return <DevControlPanel />;
  }

  return notFound();
}
