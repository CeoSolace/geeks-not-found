import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { connectDb } from '../../../../lib/db';
import User from '../../../../models/User';
import AuditLog from '../../../../models/AuditLog';

const FOUNDER_USERNAME = 'FounderMan2';

function getRequestMeta(request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return { ipAddress, userAgent };
}

async function readJson(request) {
  const type = request.headers.get('content-type') || '';
  if (!type.includes('application/json')) return {};
  return request.json().catch(() => ({}));
}

function getProvidedToken(request, body) {
  const auth = request.headers.get('authorization') || '';
  const bearer = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length).trim() : '';
  return request.headers.get('x-bootstrap-token') || bearer || body.token || '';
}

export async function POST(request) {
  const meta = getRequestMeta(request);

  try {
    const bootstrapToken = process.env.FOUNDER_BOOTSTRAP_TOKEN;
    const bootstrapPassword = process.env.FOUNDER_BOOTSTRAP_PASSWORD;

    if (!bootstrapToken || !bootstrapPassword) {
      return NextResponse.json(
        { ok: false, message: 'Founder bootstrap recovery is not enabled.' },
        { status: 404 }
      );
    }

    const body = await readJson(request);
    const providedToken = getProvidedToken(request, body);

    if (!providedToken || providedToken !== bootstrapToken) {
      await connectDb();
      await AuditLog.create({
        user: null,
        action: 'founder_bootstrap_denied',
        description: 'Founder bootstrap recovery denied because the token was missing or invalid',
        ...meta,
      });

      return NextResponse.json({ ok: false, message: 'Not authorised' }, { status: 401 });
    }

    await connectDb();

    const passwordHash = await bcrypt.hash(bootstrapPassword, 12);
    const before = await User.findOne({ username: FOUNDER_USERNAME }).lean();

    const founder = await User.findOneAndUpdate(
      { username: FOUNDER_USERNAME },
      {
        $set: {
          name: 'Founder',
          email: before?.email || '',
          passwordHash,
          role: 'founder',
          mustChangePassword: true,
          locked: false,
          disabled: false,
          failedLoginAttempts: 0,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    await AuditLog.create({
      user: founder._id,
      action: 'founder_bootstrap_recovered',
      description: 'FounderMan2 was restored through the env-gated bootstrap recovery endpoint',
      before: before
        ? {
            id: String(before._id),
            role: before.role,
            locked: before.locked,
            disabled: before.disabled,
            mustChangePassword: before.mustChangePassword,
          }
        : null,
      after: {
        id: String(founder._id),
        role: founder.role,
        locked: founder.locked,
        disabled: founder.disabled,
        mustChangePassword: founder.mustChangePassword,
      },
      ...meta,
    });

    return NextResponse.json({
      ok: true,
      message: 'FounderMan2 restored. Log in with FOUNDER_BOOTSTRAP_PASSWORD and change it immediately.',
      username: FOUNDER_USERNAME,
      mustChangePassword: true,
    });
  } catch (err) {
    console.error('Founder bootstrap recovery error:', err);
    return NextResponse.json(
      { ok: false, message: 'Founder bootstrap recovery failed. Check Render logs.' },
      { status: 500 }
    );
  }
}
