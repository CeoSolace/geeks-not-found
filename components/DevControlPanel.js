"use client";

import { useState } from 'react';

const actions = [
  {
    action: 'resetFounder',
    title: 'Reset Founder Access',
    text: 'Restores founder setup access and requires a new password on next sign-in.',
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

  const runAction = async (event, action) => {
    event.preventDefault();
    event.stopPropagation();

    setBusy(action);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('action', action);

      const res = await fetch('/api/dev-control/action', {
        method: 'POST',
        body: formData,
        redirect: 'follow',
        credentials: 'same-origin',
      });

      let text = '';
      try {
        text = await res.text();
      } catch (_) {}

      if (!res.ok) {
        const msg = 'Action failed. Check Render logs.';
        setMessage(msg);
        window.alert(msg);
        return;
      }

      const success = 'Success — action completed and you stayed on the control panel.';
      setMessage(success);
      window.alert(success);
    } catch (err) {
      const msg = 'Action failed before reaching the server.';
      setMessage(msg);
      window.alert(msg);
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
          <p className="text-slate-300 mt-2">Buttons now use JavaScript background requests, not browser form navigation.</p>
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
                onClick={(event) => runAction(event, item.action)}
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
