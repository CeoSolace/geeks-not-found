import { NextResponse } from 'next/server';
import { connectDb } from '../../../../../lib/db';
import AuditCategory from '../../../../../models/AuditCategory';
import AuditLog from '../../../../../models/AuditLog';

function cleanQuestions(questions = []) {
  return questions
    .map((q, index) => ({
      label: String(q.label || '').trim(),
      type: q.type === 'boolean' ? 'boolean' : 'shortText',
      required: Boolean(q.required),
      order: index,
    }))
    .filter((q) => q.label);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { categoryId, action } = body;

    if (!categoryId || !action) {
      return NextResponse.json({ message: 'Missing categoryId or action' }, { status: 400 });
    }

    await connectDb();
    const category = await AuditCategory.findById(categoryId);

    if (!category) {
      return NextResponse.json({ message: 'Audit category not found' }, { status: 404 });
    }

    const before = category.toObject();

    if (action === 'delete') {
      category.active = false;
      await category.save();
      await AuditLog.create({ action: 'audit_category_archived', description: `Archived audit category: ${category.name}`, before, after: category.toObject() });
      return NextResponse.json({ message: 'Audit category archived' });
    }

    if (action === 'restore') {
      category.active = true;
      await category.save();
      await AuditLog.create({ action: 'audit_category_restored', description: `Restored audit category: ${category.name}`, before, after: category.toObject() });
      return NextResponse.json({ message: 'Audit category restored' });
    }

    if (action === 'update') {
      const name = String(body.name || '').trim();
      const description = String(body.description || '').trim();
      const questions = cleanQuestions(body.questions || []);

      if (!name) return NextResponse.json({ message: 'Category name is required' }, { status: 400 });
      if (questions.length === 0) return NextResponse.json({ message: 'Add at least one question' }, { status: 400 });

      category.name = name;
      category.description = description;
      category.questions = questions;
      await category.save();

      await AuditLog.create({ action: 'audit_category_updated', description: `Updated audit category: ${name}`, before, after: category.toObject() });
      return NextResponse.json({ message: 'Audit category updated', category });
    }

    return NextResponse.json({ message: 'Unknown action' }, { status: 400 });
  } catch (err) {
    console.error('Audit category action error:', err);
    return NextResponse.json({ message: 'Could not update audit category' }, { status: 500 });
  }
}
