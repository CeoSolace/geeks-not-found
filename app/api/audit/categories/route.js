import { NextResponse } from 'next/server';
import { connectDb } from '../../../../lib/db';
import AuditCategory from '../../../../models/AuditCategory';
import AuditLog from '../../../../models/AuditLog';

export async function GET() {
  try {
    await connectDb();
    const categories = await AuditCategory.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ categories });
  } catch (err) {
    console.error('List audit categories error:', err);
    return NextResponse.json({ message: 'Could not load audit categories' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const name = String(body.name || '').trim();
    const description = String(body.description || '').trim();
    const questions = Array.isArray(body.questions) ? body.questions : [];

    if (!name) {
      return NextResponse.json({ message: 'Category name is required' }, { status: 400 });
    }

    const cleanQuestions = questions
      .map((q, index) => ({
        label: String(q.label || '').trim(),
        type: q.type === 'boolean' ? 'boolean' : 'shortText',
        required: Boolean(q.required),
        order: index,
      }))
      .filter((q) => q.label);

    if (cleanQuestions.length === 0) {
      return NextResponse.json({ message: 'Add at least one question' }, { status: 400 });
    }

    await connectDb();
    const category = await AuditCategory.create({ name, description, questions: cleanQuestions });

    await AuditLog.create({
      action: 'audit_category_created',
      description: `Created audit category: ${name}`,
      after: { name, description, questions: cleanQuestions },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (err) {
    console.error('Create audit category error:', err);
    if (err.code === 11000) {
      return NextResponse.json({ message: 'A category with this name already exists' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Could not create audit category' }, { status: 500 });
  }
}
