import { NextResponse } from 'next/server';
import { connectDb } from '../../../../lib/db';
import User from '../../../../models/User';
import AuditLog from '../../../../models/AuditLog';

export async function POST(request) {
  try {
    const { userId, action } = await request.json();

    if (!userId || !action) {
      return NextResponse.json({ message: 'Missing userId or action' }, { status: 400 });
    }

    await connectDb();
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ message: 'Staff account not found' }, { status: 404 });
    }

    if (user.role === 'founder') {
      return NextResponse.json({ message: 'Founder account cannot be changed from staff management' }, { status: 403 });
    }

    const before = {
      locked: user.locked,
      disabled: user.disabled,
      role: user.role,
    };

    if (action === 'lock') user.locked = true;
    else if (action === 'unlock') user.locked = false;
    else if (action === 'disable') user.disabled = true;
    else if (action === 'enable') user.disabled = false;
    else return NextResponse.json({ message: 'Unknown action' }, { status: 400 });

    await user.save();

    await AuditLog.create({
      user: null,
      action: `staff_${action}`,
      description: `${action} staff account ${user.username}`,
      before,
      after: { locked: user.locked, disabled: user.disabled, role: user.role },
    });

    return NextResponse.json({ message: `Staff account ${action} complete` });
  } catch (err) {
    console.error('Staff action error:', err);
    return NextResponse.json({ message: 'Could not update staff account' }, { status: 500 });
  }
}
