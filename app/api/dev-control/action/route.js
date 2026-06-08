import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { connectDb } from '../../../../lib/db';
import User from '../../../../models/User';
import AuditLog from '../../../../models/AuditLog';
import { cookies } from 'next/headers';

export async function POST(request) {
  const formData = await request.formData();
  const action = formData.get('action');
  const cookieStore = cookies();
  const token = cookieStore.get('devtoken');
  if (!token || token.value !== process.env.DEV_CONTROL_KEY) {
    return NextResponse.json({ message: 'Not authorised' }, { status: 401 });
  }
  await connectDb();
  switch (action) {
    case 'resetFounder': {
      const founder = await User.findOne({ role: 'founder' });
      if (founder) {
        founder.passwordHash = await bcrypt.hash('password123', 12);
        founder.mustChangePassword = true;
        founder.locked = false;
        founder.disabled = false;
        await founder.save();
        await AuditLog.create({
          user: null,
          action: 'dev_reset_founder',
          description: 'Developer reset founder password and unlocked account',
        });
      }
      return NextResponse.redirect('/' + process.env.DEV_CONTROL_ROUTE + '/dashboard');
    }
    case 'lockAll': {
      await User.updateMany({}, { locked: true });
      await AuditLog.create({
        user: null,
        action: 'dev_lock_all',
        description: 'Developer locked all accounts',
      });
      return NextResponse.redirect('/' + process.env.DEV_CONTROL_ROUTE + '/dashboard');
    }
    case 'unlockAll': {
      await User.updateMany({}, { locked: false });
      await AuditLog.create({
        user: null,
        action: 'dev_unlock_all',
        description: 'Developer unlocked all accounts',
      });
      return NextResponse.redirect('/' + process.env.DEV_CONTROL_ROUTE + '/dashboard');
    }
    case 'forceLogout': {
      // instruct client to delete token cookie by setting empty cookie
      const res = NextResponse.redirect('/' + process.env.DEV_CONTROL_ROUTE + '/dashboard');
      res.headers.append('Set-Cookie', 'token=; Path=/; HttpOnly; Max-Age=0');
      await AuditLog.create({
        user: null,
        action: 'dev_force_logout',
        description: 'Developer forced global logout by clearing tokens',
      });
      return res;
    }
    default:
      return NextResponse.json({ message: 'Unknown action' }, { status: 400 });
  }
}