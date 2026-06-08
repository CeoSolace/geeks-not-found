import { NextResponse } from 'next/server';
import crypto from 'crypto';

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 30,
};

function appBaseUrl() {
  return (process.env.APP_URL || 'https://geeks-not-found.onrender.com').replace(/\/$/, '');
}

function safeCompare(a, b) {
  if (!a || !b) return false;
  const aBuffer = Buffer.from(String(a));
  const bBuffer = Buffer.from(String(b));
  if (aBuffer.length !== bBuffer.length) return false;
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

export async function POST(request) {
  const secretKey = process.env.DEV_CONTROL_KEY;
  const secretRoute = process.env.DEV_CONTROL_ROUTE;

  if (!secretKey || !secretRoute) {
    return NextResponse.json({ message: 'Developer control not configured' }, { status: 500 });
  }

  let key = '';

  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const body = await request.json().catch(() => ({}));
    key = body.key || '';
  } else {
    const formData = await request.formData();
    key = formData.get('key') || '';
  }

  if (!safeCompare(key, secretKey)) {
    return NextResponse.redirect(new URL('/', appBaseUrl()), 303);
  }

  const redirectUrl = new URL(`/${secretRoute}/dashboard`, appBaseUrl());
  const res = NextResponse.redirect(redirectUrl, 303);
  res.cookies.set('devtoken', secretKey, COOKIE_OPTIONS);
  return res;
}
