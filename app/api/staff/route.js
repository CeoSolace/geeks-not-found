import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { connectDb } from '../../../lib/db';
import User from '../../../models/User';
import AuditLog from '../../../models/AuditLog';

function publicUser(user) {
  return {
    _id: String(user._id),
    name: user.name || '',
    username: user.username,
    email: user.email || '',
    role: user.role,
    locked: Boolean(user.locked),
    disabled: Boolean(user.disabled),
    mustChangePassword: Boolean(user.mustChangePassword),
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt || null,
  };
}

export async function GET() {
  try {
    await connectDb();
    const users = await User.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ users: users.map(publicUser) });
  } catch (err) {
    console.error('Staff load error:', err);
    return NextResponse.json({ message: 'Could not load staff' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const name = String(body.name || '').trim();
    const username = String(body.username || '').trim();
    const email = String(body.email || '').trim();
    const role = ['admin', 'staff', 'read-only'].includes(body.role) ? body.role : 'staff';
    const temporaryAccessCode = String(body.temporaryAccessCode || '').trim();

    if (!name || !username || !temporaryAccessCode) {
      return NextResponse.json({ message: 'Name, username and temporary access code are required' }, { status: 400 });
    }

    if (temporaryAccessCode.length < 8) {
      return NextResponse.json({ message: 'Temporary access code must be at least 8 characters' }, { status: 400 });
    }

    await connectDb();
    const passwordHash = await bcrypt.hash(temporaryAccessCode, 12);
    const user = await User.create({
      name,
      username,
      email,
      role,
      passwordHash,
      mustChangePassword: true,
      locked: false,
      disabled: false,
    });

    await AuditLog.create({
      user: null,
      action: 'staff_created',
      description: `Created staff account ${username}`,
      after: { name, username, email, role },
    });

    return NextResponse.json({ user: publicUser(user), message: 'Staff account created' }, { status: 201 });
  } catch (err) {
    console.error('Staff create error:', err);
    if (err.code === 11000) {
      return NextResponse.json({ message: 'Username already exists' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Could not create staff account' }, { status: 500 });
  }
}
