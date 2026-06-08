import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { connectDb } from '../../../../lib/db';
import { ensureFounder } from '../../../../lib/ensureFounder';
import User from '../../../../models/User';
import AuditLog from '../../../../models/AuditLog';

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error('AUTH_SECRET is missing');
  }
  return secret;
}

function getRequestMeta(request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return { ipAddress, userAgent };
}

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
    }

    await connectDb();
    await ensureFounder();

    const user = await User.findOne({ username: String(username).trim() });
    const meta = getRequestMeta(request);

    if (!user) {
      await AuditLog.create({ action: 'failed_login', description: `Failed login for unknown user: ${username}`, ...meta });
      return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 });
    }

    if (user.disabled) {
      await AuditLog.create({ user: user._id, action: 'blocked_login_disabled', description: 'Disabled account tried to login', ...meta });
      return NextResponse.json({ message: 'Account disabled' }, { status: 403 });
    }

    if (user.locked) {
      await AuditLog.create({ user: user._id, action: 'blocked_login_locked', description: 'Locked account tried to login', ...meta });
      return NextResponse.json({ message: 'Account locked' }, { status: 423 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      await user.save();
      await AuditLog.create({ user: user._id, action: 'failed_login', description: 'Wrong password', ...meta });
      return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 });
    }

    user.failedLoginAttempts = 0;
    user.lastLoginAt = new Date();
    await user.save();

    const token = jwt.sign(
      {
        sub: String(user._id),
        username: user.username,
        role: user.role,
        mustChangePassword: Boolean(user.mustChangePassword),
      },
      getAuthSecret(),
      { expiresIn: user.mustChangePassword ? '20m' : '8h' }
    );

    await AuditLog.create({ user: user._id, action: 'login', description: user.mustChangePassword ? 'Login accepted, password change required' : 'Login successful', ...meta });

    const res = NextResponse.json({
      message: user.mustChangePassword ? 'Password change required' : 'Logged in',
      mustChangePassword: Boolean(user.mustChangePassword),
      redirectTo: user.mustChangePassword ? '/change-password' : '/dashboard',
    });

    res.cookies.set('token', token, {
      ...COOKIE_OPTIONS,
      maxAge: user.mustChangePassword ? 60 * 20 : 60 * 60 * 8,
    });

    return res;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ message: 'Login server error. Check environment variables and MongoDB connection.' }, { status: 500 });
  }
}
