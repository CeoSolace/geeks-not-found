import bcrypt from 'bcrypt';
import User from '../models/User';

const FOUNDER_USERNAME = 'FounderMan2';

function getConfiguredFounderPassword() {
  return process.env.FOUNDER_BOOTSTRAP_PASSWORD || process.env.INITIAL_FOUNDER_PASSWORD || '';
}

export async function ensureFounder() {
  const founder = await User.findOne({ role: 'founder' });
  if (founder) return founder;

  const password = getConfiguredFounderPassword();

  // Never create a production founder with a password baked into source code.
  // Set FOUNDER_BOOTSTRAP_PASSWORD/INITIAL_FOUNDER_PASSWORD once in Render if
  // you want first-run creation, or use /api/bootstrap/recover-founder.
  if (!password) return null;

  const hash = await bcrypt.hash(password, 12);
  return User.create({
    name: 'Founder',
    username: FOUNDER_USERNAME,
    email: '',
    passwordHash: hash,
    role: 'founder',
    mustChangePassword: true,
    locked: false,
    disabled: false,
  });
}
