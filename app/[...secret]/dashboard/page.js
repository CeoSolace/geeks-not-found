import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

export default function DevDashboard({ params }) {
  const slugArray = Array.isArray(params.secret) ? params.secret : [params.secret];
  const secretRoute = process.env.DEV_CONTROL_ROUTE;
  // secret route plus 'dashboard'
  const expectedSlug = secretRoute ? `${secretRoute}/dashboard` : '';
  const currentSlug = slugArray.join('/');
  if (!secretRoute || currentSlug !== expectedSlug) {
    return notFound();
  }
  const cookieStore = cookies();
  const token = cookieStore.get('devtoken');
  if (!token || token.value !== process.env.DEV_CONTROL_KEY) {
    return notFound();
  }
  return (
    <div className="max-w-3xl mx-auto py-10">
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