"use client";

import { useState } from 'react';

export default function StaffCreatePage() {
  const [form, setForm] = useState({ name: '', username: '', email: '', role: 'staff', temporaryAccessCode: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const res = await fetch('/api/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setMessage(data.message || 'Could not create staff account');
      return;
    }

    setMessage('Staff account created. They must change their access code on first login.');
    setForm({ name: '', username: '', email: '', role: 'staff', temporaryAccessCode: '' });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
        <p className="text-xs uppercase tracking-widest text-blue-600 font-black">Founder Tool</p>
        <h1 className="text-3xl font-black mt-2">Create Staff Account</h1>
        <p className="text-slate-600 mt-2 max-w-3xl">Create staff, admin, or read-only accounts. New users are forced to change their temporary access code on first login.</p>
      </section>

      <form onSubmit={submit} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5 max-w-3xl">
        {message && <p className="rounded-xl bg-blue-50 border border-blue-200 text-blue-700 p-3 text-sm font-semibold">{message}</p>}

        <div className="grid md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Full Name</span>
            <input value={form.name} onChange={(e) => update('name', e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 p-3" required />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Username</span>
            <input value={form.username} onChange={(e) => update('username', e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 p-3" required />
          </label>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Email</span>
            <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 p-3" />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Role</span>
            <select value={form.role} onChange={(e) => update('role', e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 p-3">
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
              <option value="read-only">Read Only</option>
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-bold text-slate-700">Temporary Access Code</span>
          <input type="text" value={form.temporaryAccessCode} onChange={(e) => update('temporaryAccessCode', e.target.value)} placeholder="Minimum 8 characters" className="mt-1 w-full rounded-xl border border-slate-300 p-3" required />
        </label>

        <button disabled={loading} className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-3 font-black disabled:opacity-60">{loading ? 'Creating...' : 'Create Account'}</button>
      </form>
    </div>
  );
}
