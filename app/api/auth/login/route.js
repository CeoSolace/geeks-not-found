import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { connectDb } from '../../../../lib/db';
import { ensureFounder } from '../../../../lib/ensureFounder';
import User from '../../../../models/User';
import AuditLog from '../../../../models/AuditLog';

const AUTH_COOKIE_NAME = 'pg_session';
const LEGACY_COOKIE_NAME = 'token';

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET is missing');
  return secret;
}

function normaliseUsername(value) {
  return String(value || '').trim();
}

function wantsJson(request) {
  const contentType = request.headers.get('content-type') || '';
  const accept = request.headers.get('accept') || '';
  return contentType.includes('application/json') || accept.includes('application/json');
}

function getRequestMeta(request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return { ipAddress, userAgent };
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

function signSession(user, expiresIn) {
  return jwt.sign(
    {
      sub: String(user._id),
      username: user.username,
      role: user.role,
      mustChangePassword: Boolean(user.mustChangePassword),
    },
    getAuthSecret(),
    { expiresIn }
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

function success(request, payload, token, maxAge) {
  const res = wantsJson(request)
    ? NextResponse.json(payload)
    : redirectTo(payload.redirectTo);

  res.cookies.set(AUTH_COOKIE_NAME, token, { ...COOKIE_OPTIONS, maxAge });
  res.cookies.set(LEGACY_COOKIE_NAME, token, { ...COOKIE_OPTIONS, maxAge });
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
      await AuditLog.create({ action: 'failed_login', description: `Failed login for unknown user: ${username}`, ...meta }).catch(() => null);
      return fail(request, 'Invalid username or password', 401);
    }

    if (user.disabled) {
      await AuditLog.create({ user: user._id, action: 'blocked_login_disabled', description: 'Disabled account tried to login', ...meta }).catch(() => null);
      return fail(request, 'Account disabled', 403);
    }

    if (user.locked) {
      await AuditLog.create({ user: user._id, action: 'blocked_login_locked', description: 'Locked account tried to login', ...meta }).catch(() => null);
      return fail(request, 'Account locked', 423);
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      await user.save();
      await AuditLog.create({ user: user._id, action: 'failed_login', description: 'Wrong password', ...meta }).catch(() => null);
      return fail(request, 'Invalid username or password', 401);
    }

    user.failedLoginAttempts = 0;
    user.lastLoginAt = new Date();
    await user.save();

    const mustChangePassword = Boolean(user.mustChangePassword);
    const redirectToPath = mustChangePassword ? '/change-password' : '/dashboard';
    const maxAge = mustChangePassword ? 60 * 20 : 60 * 60 * 8;
    const token = signSession(user, mustChangePassword ? '20m' : '8h');

    await AuditLog.create({
      user: user._id,
      action: 'login',
      description: mustChangePassword ? 'Login accepted, password change required' : 'Login successful',
      ...meta,
    }).catch(() => null);

    return success(
      request,
      {
        ok: true,
        message: mustChangePassword ? 'Password change required' : 'Logged in',
        username: user.username,
        role: user.role,
        mustChangePassword,
        redirectTo: redirectToPath,
      },
      token,
      maxAge
    );
  } catch (err) {
    console.error('Login error:', err);
    return fail(request, 'Login server error. Check AUTH_SECRET, MONGO_URI, and Render logs.', 500);
  }
}
