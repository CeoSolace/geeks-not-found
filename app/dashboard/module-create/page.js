"use client";

import { useEffect, useState } from 'react';

const blankQuestion = { label: '', type: 'shortText', required: false };

export default function ModuleCreatePage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([blankQuestion]);
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const loadCategories = async () => {
    const res = await fetch('/api/audit/categories', { cache: 'no-store' });
    const data = await res.json().catch(() => ({ categories: [] }));
    setCategories(data.categories || []);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const resetForm = () => {
    setName('');
    setDescription('');
    setQuestions([blankQuestion]);
    setEditingId('');
  };

  const updateQuestion = (index, key, value) => {
    setQuestions((current) => current.map((q, i) => i === index ? { ...q, [key]: value } : q));
  };

  const addQuestion = () => setQuestions((current) => [...current, blankQuestion]);
  const removeQuestion = (index) => setQuestions((current) => current.filter((_, i) => i !== index));

  const editCategory = (category) => {
    setEditingId(category._id);
    setName(category.name || '');
    setDescription(category.description || '');
    setQuestions((category.questions || []).map((q) => ({ label: q.label, type: q.type, required: Boolean(q.required) })));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const url = editingId ? '/api/audit/categories/action' : '/api/audit/categories';
    const body = editingId
      ? { categoryId: editingId, action: 'update', name, description, questions }
      : { name, description, questions };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setMessage(data.message || 'Could not save audit category');
      return;
    }

    setMessage(editingId ? 'Audit category updated.' : 'Audit category created. Staff can now fill it in.');
    resetForm();
    await loadCategories();
  };

  const archiveCategory = async (category) => {
    const res = await fetch('/api/audit/categories/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId: category._id, action: category.active === false ? 'restore' : 'delete' }),
    });
    const data = await res.json().catch(() => ({}));
    setMessage(data.message || 'Category updated');
    await loadCategories();
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
        <p className="text-xs uppercase tracking-widest text-blue-600 font-black">Founder Setup</p>
        <h1 className="text-3xl font-black mt-2">Create / Edit Audit Categories</h1>
        <p className="text-slate-600 mt-2 max-w-3xl">Create the online computer auditing categories staff fill in. Questions can be short sentence answers or yes/no answers.</p>
      </section>

      <form onSubmit={submit} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
        {message && <p className="rounded-xl bg-blue-50 border border-blue-200 text-blue-700 p-3 text-sm font-semibold">{message}</p>}

        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-black">{editingId ? 'Editing Category' : 'New Category'}</h2>
          {editingId && <button type="button" onClick={resetForm} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold">Cancel Edit</button>}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Category Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Example: Laptop Intake Audit" className="mt-1 w-full rounded-xl border border-slate-300 p-3" required />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Description</span>
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What this audit is for" className="mt-1 w-full rounded-xl border border-slate-300 p-3" />
          </label>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">Questions</h2>
            <button type="button" onClick={addQuestion} className="rounded-xl bg-slate-950 text-white px-4 py-2 text-sm font-bold">Add Question</button>
          </div>

          {questions.map((question, index) => (
            <div key={index} className="rounded-2xl border border-slate-200 p-4 grid lg:grid-cols-12 gap-3 items-end">
              <label className="lg:col-span-6 block">
                <span className="text-sm font-bold text-slate-700">Question</span>
                <input value={question.label} onChange={(e) => updateQuestion(index, 'label', e.target.value)} placeholder="Example: Has the charger been checked?" className="mt-1 w-full rounded-xl border border-slate-300 p-3" required />
              </label>
              <label className="lg:col-span-3 block">
                <span className="text-sm font-bold text-slate-700">Answer Type</span>
                <select value={question.type} onChange={(e) => updateQuestion(index, 'type', e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 p-3">
                  <option value="shortText">Short sentence</option>
                  <option value="boolean">Yes / No</option>
                </select>
              </label>
              <label className="lg:col-span-2 flex items-center gap-2 rounded-xl border border-slate-200 p-3">
                <input type="checkbox" checked={question.required} onChange={(e) => updateQuestion(index, 'required', e.target.checked)} />
                <span className="text-sm font-bold">Required</span>
              </label>
              <button type="button" onClick={() => removeQuestion(index)} className="lg:col-span-1 rounded-xl border border-red-200 text-red-600 px-3 py-3 font-bold">X</button>
            </div>
          ))}
        </div>

        <button disabled={loading} className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-3 font-black disabled:opacity-60">{loading ? 'Saving...' : editingId ? 'Update Category' : 'Create Audit Category'}</button>
      </form>

      <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-xl font-black mb-4">Existing Categories</h2>
        <div className="grid gap-3">
          {categories.length === 0 ? <p className="text-sm text-slate-500">No categories created yet.</p> : categories.map((category) => (
            <div key={category._id} className="rounded-2xl border border-slate-200 p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div>
                <p className="font-black">{category.name} {category.active === false && <span className="text-xs text-red-600">Archived</span>}</p>
                <p className="text-sm text-slate-500">{category.questions?.length || 0} questions · {category.description || 'No description'}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => editCategory(category)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold">Edit</button>
                <button type="button" onClick={() => archiveCategory(category)} className="rounded-xl border border-red-200 text-red-600 px-4 py-2 text-sm font-bold">{category.active === false ? 'Restore' : 'Archive'}</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
