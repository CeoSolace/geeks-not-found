import { notFound } from 'next/navigation';

/**
 * Catch-all route to serve the developer emergency control panel at a secret path.
 * The path must match the value of process.env.DEV_CONTROL_ROUTE exactly. Any other
 * path will return a 404 page.
 */
export default function SecretRoutePage({ params }) {
  const slugArray = Array.isArray(params.secret) ? params.secret : [params.secret];
  const slug = slugArray.join('/');
  const secretPath = process.env.DEV_CONTROL_ROUTE;
  if (!secretPath || slug !== secretPath) {
    return notFound();
  }
  // Render developer control panel skeleton
  return (
    <div className="max-w-2xl mx-auto py-10">
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