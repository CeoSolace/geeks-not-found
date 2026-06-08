import { NextResponse } from 'next/server';

export async function POST(request) {
  // Accept form submissions
  const formData = await request.formData();
  const key = formData.get('key');
  const secretKey = process.env.DEV_CONTROL_KEY;
  const secretRoute = process.env.DEV_CONTROL_ROUTE;
  if (!secretKey || !secretRoute) {
    return NextResponse.json({ message: 'Developer control not configured' }, { status: 500 });
  }
  if (key !== secretKey) {
    // Return generic 404 to avoid revealing existence
    return NextResponse.redirect('/', 303);
  }
  // Set a short-lived cookie to allow access to the control panel actions
  const res = NextResponse.redirect('/' + secretRoute + '/dashboard', 303);
  res.headers.append('Set-Cookie', `devtoken=${key}; Path=/; HttpOnly; SameSite=Lax`);
  return res;
}