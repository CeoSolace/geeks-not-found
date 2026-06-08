"use client";

import { useEffect, useState } from 'react';

export default function ModuleManagePage() {
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(null);
  const [staffName, setStaffName] = useState('');
  const [answers, setAnswers] = useState({});
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const loadCategories = async () => {
    const res = await fetch('/api/audit/categories', { cache: 'no-store' });
    const data = await res.json().catch(() => ({ categories: [] }));
    setCategories(data.categories || []);
    if (!selected && data.categories?.length) setSelected(data.categories[0]);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const setAnswer = (questionId, value) => {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  };

  const submitAudit = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setLoading(true);
    setMessage('');

    const res = await fetch('/api/audit/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId: selected._id, staffName, answers, notes }),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setMessage(data.message || 'Could not submit audit');
      return;
    }

    setAnswers({});
    setNotes('');
    setMessage('Audit submitted successfully. Founder can now see it in Audit Logs.');
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
        <p className="text-xs uppercase tracking-widest text-blue-600 font-black">Staff Audit Entry</p>
        <h1 className="text-3xl font-black mt-2">Fill In Audit Log</h1>
        <p className="text-slate-600 mt-2 max-w-3xl">Staff pick a founder-created audit category and answer each online question. Short sentence questions use text boxes; yes/no questions use a simple selector.</p>
      </section>

      <div className="grid lg:grid-cols-3 gap-6">
        <aside className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm h-fit">
          <h2 className="text-xl font-black mb-4">Audit Categories</h2>
          <div className="space-y-2">
            {categories.length === 0 ? (
              <p className="text-sm text-slate-500">No categories yet. Founder needs to create one first.</p>
            ) : categories.map((category) => (
              <button key={category._id} onClick={() => { setSelected(category); setAnswers({}); setMessage(''); }} className={`w-full text-left rounded-2xl border p-4 transition ${selected?._id === category._id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                <p className="font-black">{category.name}</p>
                <p className="text-xs text-slate-500 mt-1">{category.questions?.length || 0} questions</p>
              </button>
            ))}
          </div>
        </aside>

        <form onSubmit={submitAudit} className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
          {message && <p className="rounded-xl bg-blue-50 border border-blue-200 text-blue-700 p-3 text-sm font-semibold">{message}</p>}

          {!selected ? (
            <p className="text-slate-500">Select an audit category to start.</p>
          ) : (
            <>
              <div>
                <h2 className="text-2xl font-black">{selected.name}</h2>
                {selected.description && <p className="text-slate-600 mt-1">{selected.description}</p>}
              </div>

              <label className="block">
                <span className="text-sm font-bold text-slate-700">Staff Name</span>
                <input value={staffName} onChange={(e) => setStaffName(e.target.value)} placeholder="Who is filling this in?" className="mt-1 w-full rounded-xl border border-slate-300 p-3" required />
              </label>

              <div className="space-y-4">
                {(selected.questions || []).map((question) => (
                  <div key={question._id} className="rounded-2xl border border-slate-200 p-4">
                    <label className="block">
                      <span className="block text-sm font-black text-slate-800 mb-2">{question.label} {question.required && <span className="text-red-600">*</span>}</span>
                      {question.type === 'boolean' ? (
                        <select value={answers[question._id] ?? ''} onChange={(e) => setAnswer(question._id, e.target.value)} className="w-full rounded-xl border border-slate-300 p-3" required={question.required}>
                          <option value="">Select Yes or No</option>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      ) : (
                        <input value={answers[question._id] || ''} onChange={(e) => setAnswer(question._id, e.target.value)} placeholder="Short sentence answer" className="w-full rounded-xl border border-slate-300 p-3" required={question.required} />
                      )}
                    </label>
                  </div>
                ))}
              </div>

              <label className="block">
                <span className="text-sm font-bold text-slate-700">Extra Notes</span>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional extra notes" className="mt-1 w-full rounded-xl border border-slate-300 p-3 min-h-24" />
              </label>

              <button disabled={loading} className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-3 font-black disabled:opacity-60">{loading ? 'Submitting...' : 'Submit Audit'}</button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
