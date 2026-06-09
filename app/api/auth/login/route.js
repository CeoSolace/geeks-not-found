import { NextResponse } from 'next/server';
import {
  ENV_SESSION_COOKIE,
  LEGACY_SESSION_COOKIE,
  ENV_COOKIE_OPTIONS,
  ENV_SESSION_MAX_AGE,
  envAuthReady,
  getEnvLogin,
  getEnvPass,
  makeEnvSession,
} from '../../../../lib/envSession';

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

function redirect(path) {
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
  if (wantsJson(request)) return NextResponse.json({ ok: false, message }, { status });
  return redirect(`/login?error=${encodeURIComponent(message)}`);
}

function setSessionCookies(response, token) {
  response.cookies.set(ENV_SESSION_COOKIE, token, { ...ENV_COOKIE_OPTIONS, maxAge: ENV_SESSION_MAX_AGE });
  response.cookies.set(LEGACY_SESSION_COOKIE, token, { ...ENV_COOKIE_OPTIONS, maxAge: ENV_SESSION_MAX_AGE });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

export async function POST(request) {
  try {
    if (!envAuthReady()) {
      return fail(request, 'F_LOGIN and F_PASSWORD must be set in Render env.', 500);
    }

    const { username, password } = await readLoginBody(request);

    if (!username || !password) {
      return fail(request, 'Username and password are required', 400);
    }

    if (username !== getEnvLogin() || password !== getEnvPass()) {
      return fail(request, 'Invalid username or password', 401);
    }

    const token = makeEnvSession();
    const payload = {
      ok: true,
      message: 'Logged in',
      username: getEnvLogin(),
      role: 'founder',
      redirectTo: '/dashboard',
    };

    const res = wantsJson(request) ? NextResponse.json(payload) : redirect('/dashboard');
    return setSessionCookies(res, token);
  } catch (err) {
    console.error('Login error:', err);
    return fail(request, 'Login server error. Check F_LOGIN, F_PASSWORD and AUTH_SECRET.', 500);
  }
}
