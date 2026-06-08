import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

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

export function requireDashboardSession() {
  const session = readSession();
  if (!session) return null;
  if (session.mustChangePassword) return { ...session, mustChangePassword: true };
  return session;
}
