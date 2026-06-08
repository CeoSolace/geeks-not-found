async function getAuditData() {
  const base = process.env.APP_URL || 'https://geeks-not-found.onrender.com';
  const [categoriesRes, entriesRes] = await Promise.all([
    fetch(`${base}/api/audit/categories`, { cache: 'no-store' }),
    fetch(`${base}/api/audit/entries`, { cache: 'no-store' }),
  ]);

  const categoriesData = categoriesRes.ok ? await categoriesRes.json() : { categories: [] };
  const entriesData = entriesRes.ok ? await entriesRes.json() : { entries: [] };

  return {
    categories: categoriesData.categories || [],
    entries: entriesData.entries || [],
  };
}

export default async function AuditPage() {
  const { categories, entries } = await getAuditData();

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-blue-600 font-black">Computer Auditing</p>
          <h1 className="text-3xl font-black mt-2">Audit Logs</h1>
          <p className="text-slate-600 mt-2 max-w-3xl">Founder creates audit categories and questions. Staff fill them in online using short sentence or yes/no answers.</p>
        </div>
        <a href="/api/audit/export" className="rounded-xl bg-slate-950 text-white px-4 py-3 font-black text-center">Export CSV</a>
      </section>

      <section className="grid lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="text-sm text-slate-500 font-bold">Categories</p>
          <p className="text-4xl font-black mt-2">{categories.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="text-sm text-slate-500 font-bold">Submitted Audits</p>
          <p className="text-4xl font-black mt-2">{entries.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="text-sm text-slate-500 font-bold">Answer Types</p>
          <p className="text-lg font-black mt-2">Short Sentence / Yes-No</p>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-black">Recent Staff Submissions</h2>
          <a href="/dashboard/module-manage" className="text-sm font-bold text-blue-600 hover:underline">Fill Audit</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="p-4">Category</th>
                <th className="p-4">Staff</th>
                <th className="p-4">Answers</th>
                <th className="p-4">Notes</th>
                <th className="p-4">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr><td className="p-4 text-slate-500" colSpan="5">No audits submitted yet.</td></tr>
              ) : entries.map((entry) => (
                <tr key={entry._id} className="border-t border-slate-100 align-top">
                  <td className="p-4 font-bold">{entry.categoryName}</td>
                  <td className="p-4">{entry.staffName}</td>
                  <td className="p-4">
                    <div className="space-y-1">
                      {(entry.answers || []).map((answer) => (
                        <p key={answer.questionId} className="text-slate-700"><span className="font-semibold">{answer.label}:</span> {answer.type === 'boolean' ? (answer.value ? 'Yes' : 'No') : answer.value}</p>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-slate-600">{entry.notes || '-'}</td>
                  <td className="p-4 text-slate-500">{new Date(entry.createdAt).toLocaleString('en-GB')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
