import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { connectDb } from '../../../../lib/db';
import User from '../../../../models/User';

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
      payload = jwt.verify(tokenCookie.value, process.env.AUTH_SECRET);
    } catch (err) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
    }
    await connectDb();
    const user = await User.findById(payload.sub);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    // Always allow founder to change password; require mustChange or not
    const hash = await bcrypt.hash(newPassword, 12);
    user.passwordHash = hash;
    user.mustChangePassword = false;
    await user.save();
    // Issue new token without mustChange flag
    const newToken = jwt.sign({ sub: user._id, role: user.role }, process.env.AUTH_SECRET, { expiresIn: '8h' });
    const res = NextResponse.json({ message: 'Password updated' });
    res.headers.append('Set-Cookie', `token=${newToken}; Path=/; HttpOnly; SameSite=Lax`);
    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}