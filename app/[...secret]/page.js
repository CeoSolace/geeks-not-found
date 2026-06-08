import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

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

function DevDashboard() {
  const actionUrl = `${appBaseUrl()}/api/dev-control/action`;
  const actions = [
    { action: 'resetFounder', title: 'Reset Founder Password', text: 'Set FounderMan2 back to the setup password and require a new password.', className: 'bg-red-600 hover:bg-red-700' },
    { action: 'lockAll', title: 'Lock All Accounts', text: 'Emergency lock for every account if the system is compromised.', className: 'bg-orange-600 hover:bg-orange-700' },
    { action: 'unlockAll', title: 'Unlock All Accounts', text: 'Return account access after security checks are complete.', className: 'bg-emerald-600 hover:bg-emerald-700' },
    { action: 'forceLogout', title: 'Clear Current Auth Cookie', text: 'Remove the normal login cookie from this browser session.', className: 'bg-blue-600 hover:bg-blue-700' },
  ];

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <section className="rounded-3xl bg-slate-950 text-white p-7 shadow-xl">
          <p className="text-red-300 text-xs font-black uppercase tracking-widest">Emergency Only</p>
          <h1 className="text-3xl font-black mt-2">Developer Emergency Controls</h1>
          <p className="text-slate-300 mt-2">Use these controls only for recovery, breach response, or founder password reset.</p>
        </section>

        <section className="grid md:grid-cols-2 gap-4">
          {actions.map((item) => (
            <form key={item.action} method="POST" action={actionUrl} className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
              <input type="hidden" name="action" value={item.action} />
              <h2 className="font-black text-lg">{item.title}</h2>
              <p className="text-sm text-slate-600 mt-1 mb-4">{item.text}</p>
              <button type="submit" className={`w-full rounded-xl text-white py-3 font-black ${item.className}`}>{item.title}</button>
            </form>
          ))}
        </section>
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

    return <DevDashboard />;
  }

  return notFound();
}
