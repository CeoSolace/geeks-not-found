import { NextResponse } from 'next/server';
import {
  ENV_SESSION_COOKIE,
  LEGACY_SESSION_COOKIE,
  ENV_COOKIE_OPTIONS,
  ENV_SESSION_MAX_AGE,
  getEnvLogin,
  makeEnvSession,
} from '../../../../lib/envSession';

async function readLoginBody(request) {
  const form = await request.formData().catch(() => null);

  return {
    username: String(form?.get('username') || '').trim(),
  };
}

function redirect(path) {
  return new NextResponse(null, {
    status: 303,
    headers: {
      Location: path,
      'Cache-Control': 'no-store',
    },
  });
}

function fail(message) {
  return redirect(`/login?error=${encodeURIComponent(message)}`);
}

export async function POST(request) {
  const configuredLogin = getEnvLogin();

  if (!configuredLogin) {
    return fail('F_LOGIN must be set in Render env.');
  }

  const { username } = await readLoginBody(request);

  if (!username) {
    return fail('Username is required');
  }

  if (username !== configuredLogin) {
    return fail('Invalid username');
  }

  const token = makeEnvSession();

  const res = redirect('/dashboard');

  res.cookies.set(ENV_SESSION_COOKIE, token, {
    ...ENV_COOKIE_OPTIONS,
    maxAge: ENV_SESSION_MAX_AGE,
  });

  res.cookies.set(LEGACY_SESSION_COOKIE, token, {
    ...ENV_COOKIE_OPTIONS,
    maxAge: ENV_SESSION_MAX_AGE,
  });

  return res;
}