import mongoose from 'mongoose';
import { ref, options } from './shared.js';
const schema = new mongoose.Schema(
  {
    student: ref('User'),
    title: { type: String, required: true, maxlength: 200 },
    date: { type: Date, required: true },
  },
  options(),
);
schema.index({ student: 1, date: 1 });
export default mongoose.model('Followup', schema);
