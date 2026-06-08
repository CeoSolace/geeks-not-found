import Link from 'next/link';
import '../globals.css';

export default function DashboardLayout({ children }) {
  const menuItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/audit', label: 'Audit Log' },
    { href: '/dashboard/staff-create', label: 'Create Staff' },
    { href: '/dashboard/module-create', label: 'Create Module' },
    { href: '/dashboard/module-manage', label: 'Manage Modules' },
    { href: '/dashboard/messaging', label: 'Messaging' },
    { href: '/dashboard/staff', label: 'Staff Management' },
    { href: '/dashboard/welcome', label: 'Welcome From Callum' },
  ];
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4 space-y-2">
        <h2 className="text-xl font-bold mb-4">ProperGeeks DB</h2>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href} className="block py-2 px-3 rounded hover:bg-gray-700">
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}