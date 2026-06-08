import mongoose from 'mongoose';

const AuditAnswerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  label: { type: String, required: true },
  type: { type: String, enum: ['shortText', 'boolean'], required: true },
  value: { type: mongoose.Schema.Types.Mixed },
});

const AuditEntrySchema = new mongoose.Schema({
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'AuditCategory', required: true },
  categoryName: { type: String, required: true },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  staffName: { type: String, default: 'Unknown staff' },
  answers: { type: [AuditAnswerSchema], default: [] },
  notes: { type: String, default: '' },
}, {
  timestamps: true,
});

export default mongoose.models.AuditEntry || mongoose.model('AuditEntry', AuditEntrySchema);
