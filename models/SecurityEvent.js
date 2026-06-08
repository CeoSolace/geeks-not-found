import mongoose from 'mongoose';

const SecurityEventSchema = new mongoose.Schema({
  event: { type: String, required: true },
  details: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String },
}, {
  timestamps: true,
});

export default mongoose.models.SecurityEvent || mongoose.model('SecurityEvent', SecurityEventSchema);