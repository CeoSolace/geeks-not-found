"use client";

import { useEffect, useState } from 'react';

function normaliseCategory(category) {
  return {
    ...category,
    questions: (category.questions || []).map((q) => ({
      ...q,
      label: q.label || '',
      type: q.type || 'shortText',
      required: Boolean(q.required),
    })),
  };
}

export default function ModuleManagePage() {
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(null);
  const [edit, setEdit] = useState(null);
  const [staffName, setStaffName] = useState('');
  const [answers, setAnswers] = useState({});
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const loadCategories = async () => {
    const res = await fetch('/api/audit/categories', { cache: 'no-store' });
    const data = await res.json().catch(() => ({ categories: [] }));
    const loaded = (data.categories || []).map(normaliseCategory);
    setCategories(loaded);
    if (!selected && loaded.length) {
      setSelected(loaded[0]);
      setEdit(loaded[0]);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const selectCategory = (category) => {
    setSelected(category);
    setEdit(normaliseCategory(category));
    setAnswers({});
    setMessage('');
  };

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

  const updateQuestion = (index, key, value) => {
    setEdit((current) => ({
      ...current,
      questions: current.questions.map((q, i) => (i === index ? { ...q, [key]: value } : q)),
    }));
  };

  const addQuestion = () => {
    setEdit((current) => ({
      ...current,
      questions: [...(current.questions || []), { label: '', type: 'shortText', required: false }],
    }));
  };

  const removeQuestion = (index) => {
    setEdit((current) => ({
      ...current,
      questions: current.questions.filter((_, i) => i !== index),
    }));
  };

  const saveCategory = async () => {
    if (!edit) return;
    setLoading(true);
    setMessage('');

    const res = await fetch('/api/audit/categories/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...edit, categoryId: edit._id, action: 'update' }),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);
    setMessage(data.message || (res.ok ? 'Category saved' : 'Could not save category'));
    await loadCategories();
  };

  const toggleArchive = async (category) => {
    setLoading(true);
    setMessage('');
    const res = await fetch('/api/audit/categories/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId: category._id, action: category.active === false ? 'restore' : 'delete' }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    setMessage(data.message || 'Category updated');
    await loadCategories();
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
        <p className="text-xs uppercase tracking-widest text-blue-600 font-black">Audit Management</p>
        <h1 className="text-3xl font-black mt-2">Manage & Fill Audit Logs</h1>
        <p className="text-slate-600 mt-2 max-w-3xl">Founder can edit/archive audit categories. Staff can fill active categories in online.</p>
      </section>

      {message && <p className="rounded-xl bg-blue-50 border border-blue-200 text-blue-700 p-3 text-sm font-semibold">{message}</p>}

      <div className="grid xl:grid-cols-3 gap-6">
        <aside className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm h-fit">
          <h2 className="text-xl font-black mb-4">Audit Categories</h2>
          <div className="space-y-2">
            {categories.length === 0 ? (
              <p className="text-sm text-slate-500">No categories yet. Founder needs to create one first.</p>
            ) : categories.map((category) => (
              <div key={category._id} className={`rounded-2xl border p-3 ${selected?._id === category._id ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}>
                <button type="button" onClick={() => selectCategory(category)} className="w-full text-left">
                  <p className="font-black">{category.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{category.questions?.length || 0} questions · {category.active === false ? 'Archived' : 'Active'}</p>
                </button>
                <button type="button" onClick={() => toggleArchive(category)} disabled={loading} className="mt-3 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold hover:bg-slate-50 disabled:opacity-50">
                  {category.active === false ? 'Restore' : 'Archive'}
                </button>
              </div>
            ))}
          </div>
        </aside>

        <form onSubmit={submitAudit} className="xl:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
          {!selected ? (
            <p className="text-slate-500">Select an audit category to start.</p>
          ) : selected.active === false ? (
            <p className="text-slate-500">This category is archived. Restore it before staff can fill it in.</p>
          ) : (
            <>
              <div>
                <h2 className="text-2xl font-black">Fill: {selected.name}</h2>
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

      {edit && (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-2xl font-black">Edit Selected Category</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} className="rounded-xl border border-slate-300 p-3" placeholder="Category name" />
            <input value={edit.description || ''} onChange={(e) => setEdit({ ...edit, description: e.target.value })} className="rounded-xl border border-slate-300 p-3" placeholder="Description" />
          </div>
          <div className="space-y-3">
            {(edit.questions || []).map((q, index) => (
              <div key={index} className="grid md:grid-cols-12 gap-3 rounded-2xl border border-slate-200 p-3 items-center">
                <input value={q.label} onChange={(e) => updateQuestion(index, 'label', e.target.value)} className="md:col-span-6 rounded-xl border border-slate-300 p-3" placeholder="Question" />
                <select value={q.type} onChange={(e) => updateQuestion(index, 'type', e.target.value)} className="md:col-span-3 rounded-xl border border-slate-300 p-3">
                  <option value="shortText">Short sentence</option>
                  <option value="boolean">Yes / No</option>
                </select>
                <label className="md:col-span-2 flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={q.required} onChange={(e) => updateQuestion(index, 'required', e.target.checked)} /> Required</label>
                <button type="button" onClick={() => removeQuestion(index)} className="rounded-xl border border-red-200 text-red-600 px-3 py-2 font-bold">X</button>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={addQuestion} className="rounded-xl border border-slate-300 px-4 py-2 font-bold">Add Question</button>
            <button type="button" onClick={saveCategory} disabled={loading} className="rounded-xl bg-slate-950 text-white px-4 py-2 font-black disabled:opacity-50">Save Category</button>
          </div>
        </section>
      )}
    </div>
  );
}
