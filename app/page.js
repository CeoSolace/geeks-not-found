export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">ProperGeeks Database System</h1>
      <p className="mb-8">Welcome. Please sign in to continue.</p>
      <a
        href="/login"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Sign in
      </a>
    </main>
  );
}