import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  ENV_SESSION_COOKIE,
  LEGACY_SESSION_COOKIE,
  verifyEnvSession,
} from './envSession';

function readCookieToken() {
  const store = cookies();
  return store.get(ENV_SESSION_COOKIE)?.value || store.get(LEGACY_SESSION_COOKIE)?.value || null;
}

export function readSession() {
  return verifyEnvSession(readCookieToken());
}

export function isLoggedIn() {
  return Boolean(readSession());
}

export async function getCurrentUser() {
  const session = readSession();
  if (!session) return null;

  return {
    _id: 'env-founder',
    name: session.name || 'Founder',
    username: session.username,
    email: '',
    role: 'founder',
    mustChangePassword: false,
  };
}

export async function requireDashboardUser() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?error=Please sign in again');
  return user;
}

export async function requireFounder() {
  return requireDashboardUser();
}

export function requireDashboardSession() {
  return readSession();
}
