import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const AUTH_COOKIE_NAME = 'pg_session';
export const LEGACY_COOKIE_NAME = 'token';

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

export function getAuthSecret() {
  const secret = process.env.AUTH_SECRET || process.env.F_PASSWORD;
  if (!secret) throw new Error('AUTH_SECRET or F_PASSWORD is missing');
  return secret;
}

export function signSession(user, expiresIn = '8h') {
  return jwt.sign(
    {
      sub: user._id ? String(user._id) : 'env-founder',
      username: user.username || process.env.F_LOGIN || 'Founder',
      role: user.role || 'founder',
      mustChangePassword: false,
      authSource: user.authSource || 'env',
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
  if (!session?.username) return null;

  return {
    _id: String(session.sub || 'env-founder'),
    name: 'Founder',
    username: session.username,
    email: '',
    role: session.role || 'founder',
    mustChangePassword: false,
  };
}

export async function requireDashboardUser() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?reason=session');
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
  return session;
}
