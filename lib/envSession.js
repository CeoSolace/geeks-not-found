import jwt from 'jsonwebtoken';

export const ENV_SESSION_COOKIE = 'pg_session';
export const LEGACY_SESSION_COOKIE = 'token';
export const ENV_SESSION_MAX_AGE = 60 * 60 * 8;

export const ENV_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

export function getEnvLogin() {
  return String(process.env.F_LOGIN || '').trim();
}

export function getEnvPass() {
  return String(process.env.F_PASSWORD || '');
}

export function getEnvSecret() {
  const secret = process.env.AUTH_SECRET || process.env.F_PASSWORD;
  if (!secret) throw new Error('Missing AUTH_SECRET or F_PASSWORD');
  return secret;
}

export function envAuthReady() {
  return Boolean(getEnvLogin() && getEnvPass());
}

export function makeEnvSession() {
  const username = getEnvLogin();
  return jwt.sign(
    {
      sub: 'env-founder',
      username,
      name: 'Founder',
      role: 'founder',
      source: 'env',
    },
    getEnvSecret(),
    { expiresIn: ENV_SESSION_MAX_AGE }
  );
}

export function verifyEnvSession(token) {
  if (!token) return null;

  try {
    const payload = jwt.verify(token, getEnvSecret());
    if (payload?.source !== 'env') return null;
    if (payload?.username !== getEnvLogin()) return null;
    return payload;
  } catch (_) {
    return null;
  }
}
