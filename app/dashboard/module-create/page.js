"use client";

import { useState } from 'react';

export default function ModuleCreatePage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([
    { label: '', type: 'shortText', required: false },
  ]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const updateQuestion = (index, key, value) => {
    setQuestions((current) => current.map((q, i) => i === index ? { ...q, [key]: value } : q));
  };

  const addQuestion = () => {
    setQuestions((current) => [...current, { label: '', type: 'shortText', required: false }]);
  };

  const removeQuestion = (index) => {
    setQuestions((current) => current.filter((_, i) => i !== index));
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const res = await fetch('/api/audit/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, questions }),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setMessage(data.message || 'Could not create audit category');
      return;
    }

    setName('');
    setDescription('');
    setQuestions([{ label: '', type: 'shortText', required: false }]);
    setMessage('Audit category created. Staff can now fill it in.');
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
        <p className="text-xs uppercase tracking-widest text-blue-600 font-black">Founder Setup</p>
        <h1 className="text-3xl font-black mt-2">Create Audit Category</h1>
        <p className="text-slate-600 mt-2 max-w-3xl">Create the online computer auditing categories staff will fill in. Each question can be a short sentence answer or a yes/no answer.</p>
      </section>

      <form onSubmit={submit} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
        {message && <p className="rounded-xl bg-blue-50 border border-blue-200 text-blue-700 p-3 text-sm font-semibold">{message}</p>}

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

        <button disabled={loading} className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-3 font-black disabled:opacity-60">{loading ? 'Creating...' : 'Create Audit Category'}</button>
      </form>
    </div>
  );
}
