import mongoose from 'mongoose';
import { ref, options } from './shared.js';
const schema = new mongoose.Schema(
  { student: ref('User'), job: ref('Job'), savedAt: { type: Date, default: Date.now } },
  options(),
);
schema.index({ student: 1, job: 1 }, { unique: true });
export default mongoose.model('SavedJob', schema);
