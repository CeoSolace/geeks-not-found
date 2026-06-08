"use client";

import { useState } from 'react';

const actions = [
  {
    action: 'resetFounder',
    title: 'Reset Founder Access',
    text: 'Restores FounderMan2 setup access and requires a new password on next sign-in.',
    className: 'bg-red-600 hover:bg-red-700',
  },
  {
    action: 'lockAll',
    title: 'Lock All Accounts',
    text: 'Emergency lock for every account if the system is compromised.',
    className: 'bg-orange-600 hover:bg-orange-700',
  },
  {
    action: 'unlockAll',
    title: 'Unlock All Accounts',
    text: 'Return account access after security checks are complete.',
    className: 'bg-emerald-600 hover:bg-emerald-700',
  },
  {
    action: 'forceLogout',
    title: 'Clear Current Auth Cookie',
    text: 'Removes the normal login cookie from this browser session.',
    className: 'bg-blue-600 hover:bg-blue-700',
  },
];

export default function DevControlPanel() {
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');

  const runAction = async (action) => {
    setBusy(action);
    setMessage('');

    try {
      const res = await fetch('/api/dev-control/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage(data.message || 'Action failed. Check Render logs.');
        return;
      }

      setMessage(data.message || 'Action completed successfully.');
    } catch (err) {
      setMessage('Action failed before reaching the server.');
    } finally {
      setBusy('');
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <section className="rounded-3xl bg-slate-950 text-white p-7 shadow-xl">
          <p className="text-red-300 text-xs font-black uppercase tracking-widest">Emergency Only</p>
          <h1 className="text-3xl font-black mt-2">Developer Emergency Controls</h1>
          <p className="text-slate-300 mt-2">These buttons use background requests, so the browser stays on this dashboard instead of opening API URLs.</p>
        </section>

        {message && (
          <div className="rounded-2xl bg-white border border-slate-200 p-4 font-bold text-slate-800 shadow-sm">
            {message}
          </div>
        )}

        <section className="grid md:grid-cols-2 gap-4">
          {actions.map((item) => (
            <div key={item.action} className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
              <h2 className="font-black text-lg">{item.title}</h2>
              <p className="text-sm text-slate-600 mt-1 mb-4">{item.text}</p>
              <button
                type="button"
                onClick={() => runAction(item.action)}
                disabled={Boolean(busy)}
                className={`w-full rounded-xl text-white py-3 font-black disabled:opacity-50 ${item.className}`}
              >
                {busy === item.action ? 'Running...' : item.title}
              </button>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
