import { NextResponse } from 'next/server';
import {
  ENV_SESSION_COOKIE,
  LEGACY_SESSION_COOKIE,
} from '../../../../lib/envSession';

export async function POST() {
  const res = new NextResponse(null, {
    status: 303,
    headers: {
      Location: '/login?message=Signed%20out',
      'Cache-Control': 'no-store',
    },
  });

  res.cookies.set(ENV_SESSION_COOKIE, '', { path: '/', maxAge: 0 });
  res.cookies.set(LEGACY_SESSION_COOKIE, '', { path: '/', maxAge: 0 });
  return res;
}

export async function GET() {
  return POST();
}
