import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { connectDb } from '../../../../lib/db';
import { ensureFounder } from '../../../../lib/ensureFounder';
import User from '../../../../models/User';
import AuditLog from '../../../../models/AuditLog';
import {
  AUTH_COOKIE_NAME,
  LEGACY_COOKIE_NAME,
  AUTH_COOKIE_OPTIONS,
  signSession,
} from '../../../../lib/auth';

function getRequestMeta(request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return { ipAddress, userAgent };
}

function normaliseUsername(value) {
  return String(value || '').trim();
}

export async function POST(request) {
  const meta = getRequestMeta(request);

  try {
    const body = await request.json().catch(() => ({}));
    const username = normaliseUsername(body.username);
    const password = String(body.password || '');

    if (!username || !password) {
      return NextResponse.json({ ok: false, message: 'Username and password are required' }, { status: 400 });
    }

    await connectDb();
    await ensureFounder();

    const user = await User.findOne({ username });

    if (!user) {
      await AuditLog.create({ action: 'failed_login', description: `Failed login for unknown user: ${username}`, ...meta });
      return NextResponse.json({ ok: false, message: 'Invalid username or password' }, { status: 401 });
    }

    if (user.disabled) {
      await AuditLog.create({ user: user._id, action: 'blocked_login_disabled', description: 'Disabled account tried to login', ...meta });
      return NextResponse.json({ ok: false, message: 'Account disabled' }, { status: 403 });
    }

    if (user.locked) {
      await AuditLog.create({ user: user._id, action: 'blocked_login_locked', description: 'Locked account tried to login', ...meta });
      return NextResponse.json({ ok: false, message: 'Account locked' }, { status: 423 });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      await user.save();
      await AuditLog.create({ user: user._id, action: 'failed_login', description: 'Wrong password', ...meta });
      return NextResponse.json({ ok: false, message: 'Invalid username or password' }, { status: 401 });
    }

    user.failedLoginAttempts = 0;
    user.lastLoginAt = new Date();
    await user.save();

    const mustChangePassword = Boolean(user.mustChangePassword);
    const redirectTo = mustChangePassword ? '/change-password' : '/dashboard';
    const maxAge = mustChangePassword ? 60 * 20 : 60 * 60 * 8;
    const token = signSession(user, mustChangePassword ? '20m' : '8h');

    await AuditLog.create({
      user: user._id,
      action: 'login',
      description: mustChangePassword ? 'Login accepted, password change required' : 'Login successful',
      ...meta,
    });

    const res = NextResponse.json({
      ok: true,
      message: mustChangePassword ? 'Password change required' : 'Logged in',
      username: user.username,
      role: user.role,
      mustChangePassword,
      redirectTo,
    });

    res.cookies.set(AUTH_COOKIE_NAME, token, { ...AUTH_COOKIE_OPTIONS, maxAge });
    res.cookies.set(LEGACY_COOKIE_NAME, token, { ...AUTH_COOKIE_OPTIONS, maxAge });
    res.headers.set('Cache-Control', 'no-store');

    return res;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { ok: false, message: 'Login server error. Check AUTH_SECRET, MONGO_URI, and Render logs.' },
      { status: 500 }
    );
  }
}
