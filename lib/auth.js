import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { connectDb } from './db';
import User from '../models/User';

export const AUTH_COOKIE_NAME = 'pg_session';
export const LEGACY_COOKIE_NAME = 'token';

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

export function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET is missing');
  return secret;
}

export function signSession(user, expiresIn = '8h') {
  return jwt.sign(
    {
      sub: String(user._id),
      username: user.username,
      role: user.role,
      mustChangePassword: Boolean(user.mustChangePassword),
      sessionVersion: 2,
    },
    getAuthSecret(),
    { expiresIn }
  );
}

function readCookieToken() {
  const store = cookies();
  return store.get(AUTH_COOKIE_NAME)?.value || store.get(LEGACY_COOKIE_NAME)?.value || null;
}

export function readSession() {
  const token = readCookieToken();
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
  if (!session?.username && !session?.sub) return null;

  await connectDb();

  const query = session.username
    ? { username: String(session.username).trim() }
    : { _id: session.sub };

  const user = await User.findOne(query).lean();
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
  if (!user) redirect('/login?reason=session');
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
