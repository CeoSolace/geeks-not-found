import bcrypt from 'bcrypt';
import User from '../models/User';

export async function ensureFounder() {
  const founder = await User.findOne({ role: 'founder' });
  if (!founder) {
    const hash = await bcrypt.hash('password123', 12);
    await User.create({
      name: 'Founder',
      username: 'FounderMan2',
      email: '',
      passwordHash: hash,
      role: 'founder',
      mustChangePassword: true,
      locked: false,
      disabled: false,
    });
  }
}