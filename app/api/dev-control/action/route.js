import { NextResponse } from 'next/server';
import { connectDb } from '../../../../lib/db';
import User from '../../../../models/User';
import AuditLog from '../../../../models/AuditLog';
import { cookies } from 'next/headers';

async function readAction(request) {
  const type = request.headers.get('content-type') || '';
  if (type.includes('application/json')) {
    const body = await request.json().catch(() => ({}));
    return body.action;
  }
  const formData = await request.formData();
  return formData.get('action');
}

export async function POST(request) {
  try {
    const token = cookies().get('devtoken');

    if (!token || token.value !== process.env.DEV_CONTROL_KEY) {
      return NextResponse.json({ ok: false, message: 'Not authorised' }, { status: 401 });
    }

    const action = await readAction(request);
    await connectDb();

    if (action === 'lockAll') {
      await User.updateMany({}, { locked: true });
      await AuditLog.create({ user: null, action: 'dev_lock_all', description: 'Developer locked all accounts' });
      return NextResponse.json({ ok: true, message: 'All accounts locked.' });
    }

    if (action === 'unlockAll') {
      await User.updateMany({}, { locked: false });
      await AuditLog.create({ user: null, action: 'dev_unlock_all', description: 'Developer unlocked all accounts' });
      return NextResponse.json({ ok: true, message: 'All accounts unlocked.' });
    }

    if (action === 'forceLogout') {
      await AuditLog.create({ user: null, action: 'dev_clear_cookie', description: 'Developer cleared current auth cookie' });
      const res = NextResponse.json({ ok: true, message: 'Current login cookie cleared.' });
      res.cookies.set('token', '', { path: '/', maxAge: 0 });
      return res;
    }

    if (action === 'resetFounder') {
      await AuditLog.create({ user: null, action: 'dev_reset_founder_requested', description: 'Founder reset requested from developer panel' });
      return NextResponse.json({ ok: true, message: 'Founder reset request received. Use staff controls to complete password reset.' });
    }

    return NextResponse.json({ ok: false, message: 'Unknown action' }, { status: 400 });
  } catch (err) {
    console.error('Developer action error:', err);
    return NextResponse.json({ ok: false, message: 'Action failed. Check Render logs.' }, { status: 500 });
  }
}
