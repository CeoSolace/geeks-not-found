import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

function DevLoginPanel() {
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-4">Developer Emergency Control Panel</h1>
      <p className="mb-4">Enter the developer key to access emergency controls.</p>
      <form method="POST" action="/api/dev-control/login" className="space-y-4">
        <input type="password" name="key" placeholder="Developer Key" className="w-full border p-2 rounded" />
        <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded">Enter</button>
      </form>
      <p className="mt-4 text-sm text-gray-600">This page is not linked anywhere and must be accessed directly via the secret route.</p>
    </div>
  );
}

function DevDashboard() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Developer Emergency Controls</h1>
      <p className="mb-4 text-gray-700">Use these tools only in case of a security breach or other emergency.</p>

      <form method="POST" action="/api/dev-control/action" className="space-y-4">
        <input type="hidden" name="action" value="resetFounder" />
        <button type="submit" className="w-full bg-red-600 text-white py-2 rounded">Reset Founder Password</button>
      </form>

      <form method="POST" action="/api/dev-control/action" className="space-y-4 mt-4">
        <input type="hidden" name="action" value="lockAll" />
        <button type="submit" className="w-full bg-orange-600 text-white py-2 rounded">Lock All Accounts</button>
      </form>

      <form method="POST" action="/api/dev-control/action" className="space-y-4 mt-4">
        <input type="hidden" name="action" value="unlockAll" />
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded">Unlock All Accounts</button>
      </form>

      <form method="POST" action="/api/dev-control/action" className="space-y-4 mt-4">
        <input type="hidden" name="action" value="forceLogout" />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Force Global Logout</button>
      </form>

      <p className="mt-8 text-sm text-gray-600">These actions will be logged in the audit log.</p>
    </div>
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
    return <DevLoginPanel />;
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
