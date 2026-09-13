import mongoose from 'mongoose';
import { ref, options } from './shared.js';
import { interviewTypes, interviewStatuses } from '../utils/constants.js';
const schema = new mongoose.Schema(
  {
    application: ref('Application'),
    student: ref('User'),
    provider: ref('User'),
    job: ref('Job'),
    interviewDate: { type: String, required: true },
    interviewTime: { type: String, required: true },
    startsAt: { type: Date, required: true },
    durationMinutes: { type: Number, default: 60, min: 15, max: 480 },
    interviewType: { type: String, enum: interviewTypes, required: true },
    meetingLink: { type: String, default: '' },
    physicalLocation: { type: String, default: '' },
    notes: { type: String, default: '' },
    status: { type: String, enum: interviewStatuses, default: 'Scheduled' },
  },
  options(),
);
schema.index({ student: 1, startsAt: 1 });
schema.index({ provider: 1, startsAt: 1 });
export default mongoose.model('Interview', schema);
