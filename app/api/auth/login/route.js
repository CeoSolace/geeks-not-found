import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const AUTH_COOKIE_NAME = 'pg_session';
const LEGACY_COOKIE_NAME = 'token';

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET || process.env.F_PASSWORD;
  if (!secret) throw new Error('AUTH_SECRET or F_PASSWORD is missing');
  return secret;
}

function getFounderLogin() {
  return String(process.env.F_LOGIN || '').trim();
}

function getFounderPassword() {
  return String(process.env.F_PASSWORD || '');
}

function wantsJson(request) {
  const contentType = request.headers.get('content-type') || '';
  const accept = request.headers.get('accept') || '';
  return contentType.includes('application/json') || accept.includes('application/json');
}

async function readLoginBody(request) {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const body = await request.json().catch(() => ({}));
    return {
      username: String(body.username || '').trim(),
      password: String(body.password || ''),
    };
  }

  const form = await request.formData().catch(() => null);
  return {
    username: String(form?.get('username') || '').trim(),
    password: String(form?.get('password') || ''),
  };
}

function signEnvSession(username) {
  return jwt.sign(
    {
      sub: 'env-founder',
      username,
      role: 'founder',
      mustChangePassword: false,
      authSource: 'env',
    },
    getAuthSecret(),
    { expiresIn: '8h' }
  );
}

function redirectTo(path) {
  const safePath = path && path.startsWith('/') && !path.startsWith('//') ? path : '/dashboard';
  return new NextResponse(null, {
    status: 303,
    headers: {
      Location: safePath,
      'Cache-Control': 'no-store',
    },
  });
}

function fail(request, message, status = 400) {
  if (wantsJson(request)) {
    return NextResponse.json({ ok: false, message }, { status });
  }
  return redirectTo(`/login?error=${encodeURIComponent(message)}`);
}

function success(request, payload, token) {
  const res = wantsJson(request)
    ? NextResponse.json(payload)
    : redirectTo(payload.redirectTo);

  res.cookies.set(AUTH_COOKIE_NAME, token, { ...COOKIE_OPTIONS, maxAge: 60 * 60 * 8 });
  res.cookies.set(LEGACY_COOKIE_NAME, token, { ...COOKIE_OPTIONS, maxAge: 60 * 60 * 8 });
  res.headers.set('Cache-Control', 'no-store');
  return res;
}

export async function POST(request) {
  try {
    const configuredLogin = getFounderLogin();
    const configuredPassword = getFounderPassword();

    if (!configuredLogin || !configuredPassword) {
      return fail(request, 'F_LOGIN and F_PASSWORD must be set in Render env.', 500);
    }

    const { username, password } = await readLoginBody(request);

    if (!username || !password) {
      return fail(request, 'Username and password are required', 400);
    }

    if (username !== configuredLogin || password !== configuredPassword) {
      return fail(request, 'Invalid username or password', 401);
    }

    const token = signEnvSession(configuredLogin);

    return success(
      request,
      {
        ok: true,
        message: 'Logged in',
        username: configuredLogin,
        role: 'founder',
        mustChangePassword: false,
        redirectTo: '/dashboard',
      },
      token
    );
  } catch (err) {
    console.error('Env login error:', err);
    return fail(request, 'Login server error. Check F_LOGIN, F_PASSWORD, and AUTH_SECRET.', 500);
  }
}
