import { NextResponse } from 'next/server';
import { connectDb } from '../../../../lib/db';
import AuditCategory from '../../../../models/AuditCategory';
import AuditEntry from '../../../../models/AuditEntry';
import AuditLog from '../../../../models/AuditLog';

export async function GET() {
  try {
    await connectDb();
    const entries = await AuditEntry.find({}).sort({ createdAt: -1 }).limit(100).lean();
    return NextResponse.json({ entries });
  } catch (err) {
    console.error('List audit entries error:', err);
    return NextResponse.json({ message: 'Could not load audit entries' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const categoryId = body.categoryId;
    const rawAnswers = body.answers || {};
    const staffName = String(body.staffName || 'Staff').trim();
    const notes = String(body.notes || '').trim();

    if (!categoryId) {
      return NextResponse.json({ message: 'Category is required' }, { status: 400 });
    }

    await connectDb();
    const category = await AuditCategory.findById(categoryId);

    if (!category || !category.active) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    const answers = category.questions.map((question) => {
      const key = String(question._id);
      let value = rawAnswers[key];

      if (question.type === 'boolean') {
        value = value === true || value === 'true' || value === 'yes';
      } else {
        value = String(value || '').trim();
      }

      return {
        questionId: question._id,
        label: question.label,
        type: question.type,
        value,
      };
    });

    const missingRequired = answers.find((answer) => {
      const original = category.questions.find((q) => String(q._id) === String(answer.questionId));
      return original?.required && (answer.value === '' || answer.value === undefined || answer.value === null);
    });

    if (missingRequired) {
      return NextResponse.json({ message: `Missing required answer: ${missingRequired.label}` }, { status: 400 });
    }

    const entry = await AuditEntry.create({
      category: category._id,
      categoryName: category.name,
      staffName,
      answers,
      notes,
    });

    await AuditLog.create({
      action: 'audit_entry_submitted',
      description: `${staffName} submitted audit: ${category.name}`,
      after: { category: category.name, answers, notes },
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (err) {
    console.error('Create audit entry error:', err);
    return NextResponse.json({ message: 'Could not submit audit entry' }, { status: 500 });
  }
}
