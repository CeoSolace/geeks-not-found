const stats = [
  { label: 'Staff Accounts', value: '1', detail: 'Founder account active' },
  { label: 'Database Logs', value: '0', detail: 'Create your first log type' },
  { label: 'Audit Events', value: 'Live', detail: 'Every important action tracked' },
  { label: 'System Status', value: 'Online', detail: 'Render deployment ready' },
];

const quickActions = [
  { title: 'Create Staff Account', href: '/dashboard/staff-create', text: 'Add admin, staff, or read-only users.' },
  { title: 'Create Log Type', href: '/dashboard/module-create', text: 'Build a custom database section for repairs, stock, jobs, or customers.' },
  { title: 'Open Messaging', href: '/dashboard/messaging', text: 'Send internal notes and announcements.' },
  { title: 'View Audit Log', href: '/dashboard/audit', text: 'See what happened and who did it.' },
];

export default function DashboardHome() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-br from-slate-950 to-blue-950 text-white p-6 sm:p-8 shadow-xl">
        <p className="text-blue-300 font-bold uppercase tracking-widest text-xs">Main Dashboard</p>
        <h2 className="text-3xl sm:text-4xl font-black mt-2">Everything ProperGeeks needs, in one clean system.</h2>
        <p className="text-slate-300 mt-3 max-w-3xl">Track staff, logs, devices, repairs, jobs, messages, and changes from a dashboard designed to be simple enough for tablets and strong enough for daily business use.</p>
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
          <h3 className="text-xl font-black mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {['System ready for first founder login', 'Audit logging enabled', 'Emergency control protected by secret route', 'Database modules ready to be configured'].map((item) => (
              <div key={item} className="flex gap-3 items-start rounded-xl bg-slate-50 p-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
                <p className="text-sm text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
