import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { connectDb } from '../../../../lib/db';
import User from '../../../../models/User';

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET is missing');
  return secret;
}

export async function POST(request) {
  try {
    const { newPassword } = await request.json();

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ message: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const tokenCookie = request.cookies.get('token');
    if (!tokenCookie) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    let payload;
    try {
      payload = jwt.verify(tokenCookie.value, getAuthSecret());
    } catch (err) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
    }

    await connectDb();
    const user = await User.findById(payload.sub);

    if (!user || user.locked || user.disabled) {
      return NextResponse.json({ message: 'User not found or unavailable' }, { status: 404 });
    }

    const hash = await bcrypt.hash(newPassword, 12);
    user.passwordHash = hash;
    user.mustChangePassword = false;
    user.failedLoginAttempts = 0;
    await user.save();

    const newToken = jwt.sign(
      {
        sub: String(user._id),
        username: user.username,
        role: user.role,
        mustChangePassword: false,
      },
      getAuthSecret(),
      { expiresIn: '8h' }
    );

    const res = NextResponse.json({ message: 'Password updated', redirectTo: '/dashboard' });
    res.cookies.set('token', newToken, {
      ...COOKIE_OPTIONS,
      maxAge: 60 * 60 * 8,
    });

    return res;
  } catch (err) {
    console.error('Change password error:', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
