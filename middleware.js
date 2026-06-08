import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const protectedPrefixes = ['/dashboard'];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const needsProtection = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (!needsProtection) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;

  if (!token || !process.env.AUTH_SECRET) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const session = jwt.verify(token, process.env.AUTH_SECRET);
    if (session.mustChangePassword && pathname !== '/change-password') {
      return NextResponse.redirect(new URL('/change-password', request.url));
    }
    return NextResponse.next();
  } catch (_) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
