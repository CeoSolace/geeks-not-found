import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { connectDb } from './db';
import User from '../models/User';

export function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET is missing');
  return secret;
}

export function readSession() {
  const token = cookies().get('token')?.value;
  if (!token) return null;

  try {
    return jwt.verify(token, getAuthSecret());
  } catch (_) {
    return null;
  }
}

export function isLoggedIn() {
  return Boolean(readSession());
}

export async function getCurrentUser() {
  const session = readSession();
  if (!session?.sub) return null;

  await connectDb();
  const user = await User.findById(session.sub).lean();
  if (!user || user.locked || user.disabled) return null;

  return {
    _id: String(user._id),
    name: user.name || '',
    username: user.username,
    email: user.email || '',
    role: user.role,
    mustChangePassword: Boolean(user.mustChangePassword),
  };
}

export async function requireDashboardUser() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.mustChangePassword) redirect('/change-password');
  return user;
}

export async function requireFounder() {
  const user = await requireDashboardUser();
  if (user.role !== 'founder') redirect('/dashboard');
  return user;
}

export function requireDashboardSession() {
  const session = readSession();
  if (!session) return null;
  if (session.mustChangePassword) return { ...session, mustChangePassword: true };
  return session;
}
