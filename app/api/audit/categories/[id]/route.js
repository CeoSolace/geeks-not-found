import { NextResponse } from 'next/server';
import { connectDb } from '../../../../../lib/db';
import AuditCategory from '../../../../../models/AuditCategory';
import AuditLog from '../../../../../models/AuditLog';

export async function PATCH(request, { params }) {
  try {
    const body = await request.json();
    await connectDb();

    const category = await AuditCategory.findById(params.id);
    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    const before = category.toObject();

    if (typeof body.name === 'string') category.name = body.name.trim();
    if (typeof body.description === 'string') category.description = body.description.trim();
    if (typeof body.active === 'boolean') category.active = body.active;

    if (Array.isArray(body.questions)) {
      category.questions = body.questions
        .map((q, index) => ({
          label: String(q.label || '').trim(),
          type: q.type === 'boolean' ? 'boolean' : 'shortText',
          required: Boolean(q.required),
          order: index,
        }))
        .filter((q) => q.label);
    }

    await category.save();

    await AuditLog.create({
      user: null,
      action: 'audit_category_updated',
      description: `Updated audit category ${category.name}`,
      before,
      after: category.toObject(),
    });

    return NextResponse.json({ category, message: 'Category updated' });
  } catch (err) {
    console.error('Update category error:', err);
    return NextResponse.json({ message: 'Could not update category' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDb();
    const category = await AuditCategory.findById(params.id);

    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    category.active = false;
    await category.save();

    await AuditLog.create({
      user: null,
      action: 'audit_category_archived',
      description: `Archived audit category ${category.name}`,
      before: { active: true },
      after: { active: false },
    });

    return NextResponse.json({ message: 'Category archived' });
  } catch (err) {
    console.error('Archive category error:', err);
    return NextResponse.json({ message: 'Could not archive category' }, { status: 500 });
  }
}
