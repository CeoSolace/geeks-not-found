async function getStats() {
  const base = process.env.APP_URL || 'https://geeks-not-found.onrender.com';
  const res = await fetch(`${base}/api/dashboard/stats`, { cache: 'no-store' });
  if (!res.ok) {
    return { staffCount: 0, categoryCount: 0, entryCount: 0, auditEventCount: 0, recentEntries: [], recentEvents: [] };
  }
  return res.json();
}

const quickActions = [
  { title: 'Create Staff Account', href: '/dashboard/staff-create', text: 'Add admin, staff, or read-only users.' },
  { title: 'Create Audit Category', href: '/dashboard/module-create', text: 'Build a checklist for repairs, devices, stock, or jobs.' },
  { title: 'Fill Audit', href: '/dashboard/module-manage', text: 'Staff complete online computer audits.' },
  { title: 'View Audit Logs', href: '/dashboard/audit', text: 'See every submitted audit and export data.' },
];

export default async function DashboardHome() {
  const data = await getStats();
  const stats = [
    { label: 'Staff Accounts', value: data.staffCount, detail: 'Founder and team users' },
    { label: 'Audit Categories', value: data.categoryCount, detail: 'Founder-created checklists' },
    { label: 'Submitted Audits', value: data.entryCount, detail: 'Staff-filled audit records' },
    { label: 'Audit Events', value: data.auditEventCount, detail: 'Tracked system actions' },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-br from-slate-950 to-blue-950 text-white p-6 sm:p-8 shadow-xl">
        <p className="text-blue-300 font-bold uppercase tracking-widest text-xs">Main Dashboard</p>
        <h2 className="text-3xl sm:text-4xl font-black mt-2">ProperGeeks computer auditing, online.</h2>
        <p className="text-slate-300 mt-3 max-w-3xl">Create audit categories, let staff fill them in, and track every submitted entry from one simple dashboard.</p>
      </section>

      <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500 font-semibold">{stat.label}</p>
            <p className="text-3xl font-black mt-2">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-1">{stat.detail}</p>
          </div>
        ))}
      </section>

      <section className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-xl font-black mb-4">Quick Actions</h3>
          <div className="grid gap-3">
            {quickActions.map((action) => (
              <a key={action.href} href={action.href} className="block rounded-2xl border border-slate-200 p-4 hover:border-blue-400 hover:bg-blue-50 transition">
                <p className="font-black">{action.title}</p>
                <p className="text-sm text-slate-600 mt-1">{action.text}</p>
              </a>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-xl font-black mb-4">Recent Staff Audits</h3>
          <div className="space-y-3">
            {(data.recentEntries || []).length === 0 ? (
              <p className="text-sm text-slate-500">No audit entries yet.</p>
            ) : data.recentEntries.map((entry) => (
              <div key={entry._id} className="rounded-xl bg-slate-50 p-3">
                <p className="font-bold">{entry.categoryName}</p>
                <p className="text-sm text-slate-600">Submitted by {entry.staffName || 'Staff'} · {new Date(entry.createdAt).toLocaleString('en-GB')}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
