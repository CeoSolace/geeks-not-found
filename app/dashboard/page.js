import { connectDb } from '../../lib/db';
import User from '../../models/User';
import AuditLog from '../../models/AuditLog';
import AuditCategory from '../../models/AuditCategory';
import AuditEntry from '../../models/AuditEntry';

async function getStats() {
  try {
    await connectDb();

    const [staffCount, categoryCount, entryCount, auditEventCount, recentEntries, recentEvents] = await Promise.all([
      User.countDocuments({}),
      AuditCategory.countDocuments({}),
      AuditEntry.countDocuments({}),
      AuditLog.countDocuments({}),
      AuditEntry.find({}).sort({ createdAt: -1 }).limit(5).lean(),
      AuditLog.find({}).sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    return {
      staffCount,
      categoryCount,
      entryCount,
      auditEventCount,
      recentEntries: recentEntries.map((entry) => ({
        _id: String(entry._id),
        categoryName: entry.categoryName,
        staffName: entry.staffName,
        createdAt: entry.createdAt?.toISOString?.() || null,
      })),
      recentEvents: recentEvents.map((event) => ({
        _id: String(event._id),
        action: event.action,
        description: event.description,
        createdAt: event.createdAt?.toISOString?.() || null,
      })),
    };
  } catch (err) {
    console.error('Dashboard stats load error:', err);
    return { staffCount: 0, categoryCount: 0, entryCount: 0, auditEventCount: 0, recentEntries: [], recentEvents: [] };
  }
}

const quickActions = [
  { title: 'Create Staff Account', href: '/dashboard/staff-create', text: 'Add admin, staff, or read-only users.' },
  { title: 'Create Audit Category', href: '/dashboard/module-create', text: 'Build a checklist for repairs, devices, stock, or jobs.' },
  { title: 'Fill Audit', href: '/dashboard/module-manage', text: 'Staff complete online computer audits.' },
  { title: 'View Audit Logs', href: '/dashboard/audit', text: 'See every submitted audit and export data.' },
];

function formatDate(value) {
  if (!value) return 'Unknown time';
  return new Date(value).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' });
}

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
      <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <p className="text-blue-300 font-bold uppercase tracking-widest text-xs">Founder Dashboard</p>
        <h2 className="text-3xl sm:text-4xl font-black mt-2">ProperGeeks control centre is back.</h2>
        <p className="text-slate-300 mt-3 max-w-3xl">Manage staff, audit categories, submitted device logs, and system events from one protected dashboard.</p>
      </section>

      <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500 font-semibold">{stat.label}</p>
            <p className="text-3xl font-black mt-2 text-slate-950">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-1">{stat.detail}</p>
          </div>
        ))}
      </section>

      <section className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-xl font-black mb-4 text-slate-950">Quick Actions</h3>
          <div className="grid gap-3">
            {quickActions.map((action) => (
              <a key={action.href} href={action.href} className="block rounded-2xl border border-slate-200 p-4 hover:border-blue-400 hover:bg-blue-50 transition">
                <p className="font-black text-slate-950">{action.title}</p>
                <p className="text-sm text-slate-600 mt-1">{action.text}</p>
              </a>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-xl font-black mb-4 text-slate-950">Recent Staff Audits</h3>
          <div className="space-y-3">
            {(data.recentEntries || []).length === 0 ? (
              <p className="text-sm text-slate-500">No audit entries yet.</p>
            ) : data.recentEntries.map((entry) => (
              <div key={entry._id} className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <p className="font-bold text-slate-950">{entry.categoryName}</p>
                <p className="text-sm text-slate-600">Submitted by {entry.staffName || 'Staff'} · {formatDate(entry.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-xl font-black mb-4 text-slate-950">Recent System Events</h3>
        <div className="grid gap-3">
          {(data.recentEvents || []).length === 0 ? (
            <p className="text-sm text-slate-500">No system events yet.</p>
          ) : data.recentEvents.map((event) => (
            <div key={event._id} className="rounded-xl bg-slate-50 p-3 border border-slate-100">
              <p className="font-bold text-slate-950">{event.action}</p>
              <p className="text-sm text-slate-600">{event.description || 'No details'} · {formatDate(event.createdAt)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
