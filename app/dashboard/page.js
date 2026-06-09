const cards = [
  {
    title: 'Dashboard Ready',
    value: 'Online',
    text: 'The dashboard shell is loading from the env-login session.',
  },
  {
    title: 'Login System',
    value: 'Env',
    text: 'Access is controlled by F_LOGIN and the session cookie.',
  },
  {
    title: 'Data Layer',
    value: 'Optional',
    text: 'MongoDB can be used by tools, but it no longer controls dashboard access.',
  },
  {
    title: 'Founder Access',
    value: 'Active',
    text: 'The signed-in env user is treated as founder.',
  },
];

const quickActions = [
  { title: 'Create Log Type', href: '/dashboard/module-create', text: 'Build new internal checklists.' },
  { title: 'Manage Logs', href: '/dashboard/module-manage', text: 'Open the log management area.' },
  { title: 'View Activity', href: '/dashboard/audit', text: 'Review saved activity pages.' },
  { title: 'Staff Area', href: '/dashboard/staff', text: 'Open staff management pages.' },
];

export default function DashboardHome() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-6 text-white shadow-xl sm:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-300">Founder Dashboard</p>
        <h2 className="mt-2 text-3xl font-black sm:text-4xl">ProperGeeks control centre.</h2>
        <p className="mt-3 max-w-3xl text-slate-300">
          The dashboard is now independent from the old MongoDB login system. Login creates an env-based session, then this area opens directly.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">{card.title}</p>
            <p className="mt-2 text-3xl font-black text-slate-950">{card.value}</p>
            <p className="mt-1 text-sm text-slate-500">{card.text}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-xl font-black text-slate-950">Quick Actions</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {quickActions.map((action) => (
            <a key={action.href} href={action.href} className="block rounded-2xl border border-slate-200 p-4 transition hover:border-blue-400 hover:bg-blue-50">
              <p className="font-black text-slate-950">{action.title}</p>
              <p className="mt-1 text-sm text-slate-600">{action.text}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
