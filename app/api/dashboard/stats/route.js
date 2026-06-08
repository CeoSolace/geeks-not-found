import { NextResponse } from 'next/server';
import { connectDb } from '../../../../lib/db';
import User from '../../../../models/User';
import AuditLog from '../../../../models/AuditLog';
import AuditCategory from '../../../../models/AuditCategory';
import AuditEntry from '../../../../models/AuditEntry';

export async function GET() {
  try {
    await connectDb();

    const [staffCount, categoryCount, entryCount, auditEventCount, recentEntries, recentEvents] = await Promise.all([
      User.countDocuments({}),
      AuditCategory.countDocuments({}),
      AuditEntry.countDocuments({}),
      AuditLog.countDocuments({}),
      AuditEntry.find({}).sort({ createdAt: -1 }).limit(5).lean(),
      AuditLog.find({}).sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    return NextResponse.json({
      staffCount,
      categoryCount,
      entryCount,
      auditEventCount,
      recentEntries,
      recentEvents,
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    return NextResponse.json({ message: 'Could not load dashboard stats' }, { status: 500 });
  }
}
