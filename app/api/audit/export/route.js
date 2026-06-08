import { NextResponse } from 'next/server';
import { connectDb } from '../../../../lib/db';
import AuditEntry from '../../../../models/AuditEntry';

function csvEscape(value) {
  const stringValue = String(value ?? '');
  return `"${stringValue.replaceAll('"', '""')}"`;
}

export async function GET() {
  try {
    await connectDb();
    const entries = await AuditEntry.find({}).sort({ createdAt: -1 }).lean();

    const rows = [['Category', 'Staff', 'Submitted At', 'Question', 'Answer', 'Notes']];

    entries.forEach((entry) => {
      (entry.answers || []).forEach((answer) => {
        rows.push([
          entry.categoryName,
          entry.staffName,
          new Date(entry.createdAt).toLocaleString('en-GB'),
          answer.label,
          answer.type === 'boolean' ? (answer.value ? 'Yes' : 'No') : answer.value,
          entry.notes || '',
        ]);
      });
    });

    const csv = rows.map((row) => row.map(csvEscape).join(',')).join('\n');

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="propergeeks-audit-submissions.csv"',
      },
    });
  } catch (err) {
    console.error('Audit export error:', err);
    return NextResponse.json({ message: 'Could not export audit submissions' }, { status: 500 });
  }
}
