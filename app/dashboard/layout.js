import Link from 'next/link';
import { requireDashboardUser } from '../../lib/auth';

export default async function DashboardLayout({ children }) {
  const user = await requireDashboardUser();

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '▦' },
    { href: '/dashboard/audit', label: 'Audit Log', icon: '☰' },
    { href: '/dashboard/staff-create', label: 'Create Staff', icon: '+' },
    { href: '/dashboard/module-create', label: 'Create Log Type', icon: '✦' },
    { href: '/dashboard/module-manage', label: 'Manage Logs', icon: '▣' },
    { href: '/dashboard/messaging', label: 'Messaging', icon: '✉' },
    { href: '/dashboard/staff', label: 'Staff', icon: '◉' },
    { href: '/dashboard/welcome', label: 'From Callum', icon: '♡' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 lg:flex">
      <aside className="lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 bg-slate-950 text-white border-r border-slate-800">
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-lg text-white">PG</div>
            <div>
              <h2 className="text-lg font-black leading-tight text-white">ProperGeeks</h2>
              <p className="text-xs text-slate-400">Database System</p>
            </div>
          </div>
        </div>

        <nav className="p-4 grid gap-1">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition">
              <span className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-blue-300">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 text-xs text-slate-500 border-t border-slate-800 mt-4 space-y-3">
          <p>Built for ProperGeeks by Callum.</p>
          <form method="POST" action="/api/auth/logout">
            <button className="w-full rounded-xl bg-slate-800 px-3 py-2 text-sm font-bold text-white hover:bg-slate-700" type="submit">
              Logout
            </button>
          </form>
        </div>
      </aside>

      <main className="lg:ml-72 flex-1 min-h-screen">
        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200 px-4 sm:px-8 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-blue-600 font-bold">Internal Dashboard</p>
            <h1 className="text-lg sm:text-xl font-black text-slate-950">ProperGeeks Database System</h1>
          </div>
          <div className="text-right">
            <p className="text-sm font-black text-slate-950">{user.name || user.username}</p>
            <p className="text-xs text-slate-500 capitalize">{user.role}</p>
          </div>
        </header>

        <section className="p-4 sm:p-8">
          {children}
        </section>
      </main>
    </div>
  );
}
