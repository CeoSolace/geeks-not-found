"use client";

import { useEffect, useState } from 'react';

const actions = [
  { key: 'lock', label: 'Lock' },
  { key: 'unlock', label: 'Unlock' },
  { key: 'disable', label: 'Disable' },
  { key: 'enable', label: 'Enable' },
];

export default function StaffManagementPage() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState('');

  const loadUsers = async () => {
    const res = await fetch('/api/staff', { cache: 'no-store' });
    const data = await res.json().catch(() => ({ users: [] }));
    setUsers(data.users || []);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const runAction = async (userId, action) => {
    setBusy(`${userId}-${action}`);
    setMessage('');

    const res = await fetch('/api/staff/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action }),
    });

    const data = await res.json().catch(() => ({}));
    setMessage(data.message || (res.ok ? 'Action complete' : 'Action failed'));
    setBusy('');
    await loadUsers();
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
        <p className="text-xs uppercase tracking-widest text-blue-600 font-black">Staff Management</p>
        <h1 className="text-3xl font-black mt-2">Manage Staff Accounts</h1>
        <p className="text-slate-600 mt-2 max-w-3xl">Lock, unlock, disable or enable staff accounts. Founder accounts are protected from this screen.</p>
      </section>

      {message && <p className="rounded-xl bg-blue-50 border border-blue-200 text-blue-700 p-3 text-sm font-semibold">{message}</p>}

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Username</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td className="p-4 text-slate-500" colSpan="5">No staff accounts found.</td></tr>
              ) : users.map((user) => (
                <tr key={user._id} className="border-t border-slate-100 align-top">
                  <td className="p-4 font-bold">{user.name || 'Unnamed'}</td>
                  <td className="p-4">{user.username}</td>
                  <td className="p-4 capitalize">{user.role}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {user.locked && <span className="rounded-full bg-orange-100 text-orange-700 px-2 py-1 text-xs font-bold">Locked</span>}
                      {user.disabled && <span className="rounded-full bg-red-100 text-red-700 px-2 py-1 text-xs font-bold">Disabled</span>}
                      {user.mustChangePassword && <span className="rounded-full bg-blue-100 text-blue-700 px-2 py-1 text-xs font-bold">Needs Change</span>}
                      {!user.locked && !user.disabled && <span className="rounded-full bg-green-100 text-green-700 px-2 py-1 text-xs font-bold">Active</span>}
                    </div>
                  </td>
                  <td className="p-4">
                    {user.role === 'founder' ? (
                      <span className="text-slate-400 text-xs font-bold">Founder protected</span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {actions.map((item) => (
                          <button key={item.key} onClick={() => runAction(user._id, item.key)} disabled={Boolean(busy)} className="rounded-lg border border-slate-200 px-3 py-2 font-bold hover:bg-slate-50 disabled:opacity-50">
                            {busy === `${user._id}-${item.key}` ? '...' : item.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
