import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  channel: { type: String, enum: ['founder', 'admin', 'staff', 'private'], default: 'staff' },
  recipients: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
  content: { type: String, required: true },
  readBy: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
}, {
  timestamps: true,
});

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);