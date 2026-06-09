import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { connectDb } from '../../../../lib/db';
import { ensureFounder } from '../../../../lib/ensureFounder';
import User from '../../../../models/User';
import AuditLog from '../../../../models/AuditLog';
import {
  AUTH_COOKIE_NAME,
  LEGACY_COOKIE_NAME,
  AUTH_COOKIE_OPTIONS,
  signSession,
} from '../../../../lib/auth';

function getRequestMeta(request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return { ipAddress, userAgent };
}

function normaliseUsername(value) {
  return String(value || '').trim();
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
      username: normaliseUsername(body.username),
      password: String(body.password || ''),
    };
  }

  const form = await request.formData().catch(() => null);
  return {
    username: normaliseUsername(form?.get('username')),
    password: String(form?.get('password') || ''),
  };
}

function loginUrl(request, params = {}) {
  const url = new URL('/login', request.url);
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }
  return url;
}

function fail(request, message, status = 400) {
  if (wantsJson(request)) {
    return NextResponse.json({ ok: false, message }, { status });
  }
  return NextResponse.redirect(loginUrl(request, { error: message }), { status: 303 });
}

function success(request, payload, token, maxAge) {
  if (wantsJson(request)) {
    const res = NextResponse.json(payload);
    res.cookies.set(AUTH_COOKIE_NAME, token, { ...AUTH_COOKIE_OPTIONS, maxAge });
    res.cookies.set(LEGACY_COOKIE_NAME, token, { ...AUTH_COOKIE_OPTIONS, maxAge });
    res.headers.set('Cache-Control', 'no-store');
    return res;
  }

  const res = NextResponse.redirect(new URL(payload.redirectTo, request.url), { status: 303 });
  res.cookies.set(AUTH_COOKIE_NAME, token, { ...AUTH_COOKIE_OPTIONS, maxAge });
  res.cookies.set(LEGACY_COOKIE_NAME, token, { ...AUTH_COOKIE_OPTIONS, maxAge });
  res.headers.set('Cache-Control', 'no-store');
  return res;
}

export async function POST(request) {
  const meta = getRequestMeta(request);

  try {
    const { username, password } = await readLoginBody(request);

    if (!username || !password) {
      return fail(request, 'Username and password are required', 400);
    }

    await connectDb();
    await ensureFounder();

    const user = await User.findOne({ username });

    if (!user) {
      await AuditLog.create({ action: 'failed_login', description: `Failed login for unknown user: ${username}`, ...meta });
      return fail(request, 'Invalid username or password', 401);
    }

    if (user.disabled) {
      await AuditLog.create({ user: user._id, action: 'blocked_login_disabled', description: 'Disabled account tried to login', ...meta });
      return fail(request, 'Account disabled', 403);
    }

    if (user.locked) {
      await AuditLog.create({ user: user._id, action: 'blocked_login_locked', description: 'Locked account tried to login', ...meta });
      return fail(request, 'Account locked', 423);
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      await user.save();
      await AuditLog.create({ user: user._id, action: 'failed_login', description: 'Wrong password', ...meta });
      return fail(request, 'Invalid username or password', 401);
    }

    user.failedLoginAttempts = 0;
    user.lastLoginAt = new Date();
    await user.save();

    const mustChangePassword = Boolean(user.mustChangePassword);
    const redirectTo = mustChangePassword ? '/change-password' : '/dashboard';
    const maxAge = mustChangePassword ? 60 * 20 : 60 * 60 * 8;
    const token = signSession(user, mustChangePassword ? '20m' : '8h');

    await AuditLog.create({
      user: user._id,
      action: 'login',
      description: mustChangePassword ? 'Login accepted, password change required' : 'Login successful',
      ...meta,
    });

    return success(
      request,
      {
        ok: true,
        message: mustChangePassword ? 'Password change required' : 'Logged in',
        username: user.username,
        role: user.role,
        mustChangePassword,
        redirectTo,
      },
      token,
      maxAge
    );
  } catch (err) {
    console.error('Login error:', err);
    return fail(request, 'Login server error. Check AUTH_SECRET, MONGO_URI, and Render logs.', 500);
  }
}
