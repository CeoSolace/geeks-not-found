import mongoose from 'mongoose';

const AuditQuestionSchema = new mongoose.Schema({
  label: { type: String, required: true },
  type: { type: String, enum: ['shortText', 'boolean'], required: true, default: 'shortText' },
  required: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
});

const AuditCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  questions: { type: [AuditQuestionSchema], default: [] },
  active: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
});

export default mongoose.models.AuditCategory || mongoose.model('AuditCategory', AuditCategorySchema);
