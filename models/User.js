import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String },
  username: { type: String, required: true, unique: true },
  email: { type: String },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['founder', 'admin', 'staff', 'read-only'], required: true },
  permissions: { type: mongoose.Schema.Types.Mixed, default: {} },
  mustChangePassword: { type: Boolean, default: true },
  locked: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  lastLoginAt: { type: Date },
  failedLoginAttempts: { type: Number, default: 0 },
}, {
  timestamps: true,
});

export default mongoose.models.User || mongoose.model('User', UserSchema);