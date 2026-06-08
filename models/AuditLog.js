import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  description: { type: String },
  before: { type: mongoose.Schema.Types.Mixed },
  after: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String },
}, {
  timestamps: true,
});

export default mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);