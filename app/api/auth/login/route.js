import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { connectDb } from '../../../../lib/db';
import { ensureFounder } from '../../../../lib/ensureFounder';
import User from '../../../../models/User';

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
    }
    await connectDb();
    // ensure founder account exists on first run
    await ensureFounder();
    const user = await User.findOne({ username });
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    if (user.disabled) {
      return NextResponse.json({ message: 'Account disabled' }, { status: 403 });
    }
    if (user.locked) {
      return NextResponse.json({ message: 'Account locked' }, { status: 423 });
    }
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      user.failedLoginAttempts += 1;
      await user.save();
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    // require password change: we return special flag to redirect client to update password page
    if (user.mustChangePassword) {
      // Issue a short-lived token to allow password change route
      const token = jwt.sign({ sub: user._id, role: user.role, mustChange: true }, process.env.AUTH_SECRET, { expiresIn: '15m' });
      const res = NextResponse.json({ message: 'Password change required', mustChange: true });
      res.headers.append('Set-Cookie', `token=${token}; Path=/; HttpOnly; SameSite=Lax`);
      return res;
    }
    // Successful login
    user.failedLoginAttempts = 0;
    user.lastLoginAt = new Date();
    await user.save();
    const token = jwt.sign({ sub: user._id, role: user.role }, process.env.AUTH_SECRET, { expiresIn: '8h' });
    const res = NextResponse.json({ message: 'Logged in' });
    res.headers.append('Set-Cookie', `token=${token}; Path=/; HttpOnly; SameSite=Lax`);
    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}