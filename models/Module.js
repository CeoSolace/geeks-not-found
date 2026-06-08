import mongoose from 'mongoose';

const FieldSchema = new mongoose.Schema({
  name: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, enum: ['text', 'number', 'date', 'email', 'phone', 'checkbox', 'dropdown', 'notes', 'status', 'assigned'], required: true },
  options: { type: [String], default: [] },
  required: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
});

const ModuleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  fields: { type: [FieldSchema], default: [] },
  permissions: {
    view: { type: [String], default: ['founder', 'admin'] },
    create: { type: [String], default: ['founder', 'admin'] },
    edit: { type: [String], default: ['founder', 'admin'] },
    delete: { type: [String], default: ['founder'] },
  },
  status: { type: String, enum: ['active', 'archived', 'disabled'], default: 'active' },
}, {
  timestamps: true,
});

export default mongoose.models.Module || mongoose.model('Module', ModuleSchema);