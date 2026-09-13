import mongoose from 'mongoose';
import { ref, options } from './shared.js';
import { applicationStatuses } from '../utils/constants.js';
const schema = new mongoose.Schema(
  {
    student: ref('User'),
    job: ref('Job'),
    provider: ref('User'),
    cvUrl: { type: String, required: true },
    cvUpload: ref('Upload', false),
    coverLetter: { type: String, default: '', maxlength: 10000 },
    status: { type: String, enum: applicationStatuses, default: 'Applied' },
    personalNotes: { type: String, default: '', maxlength: 10000 },
    providerNotes: { type: String, default: '', maxlength: 10000 },
    appliedAt: { type: Date, default: Date.now },
    activeSubmission: { type: Boolean, default: true },
    statusHistory: [
      {
        _id: false,
        status: { type: String, enum: applicationStatuses },
        at: { type: Date, default: Date.now },
      },
    ],
  },
  options(),
);
schema.index(
  { student: 1, job: 1 },
  { unique: true, partialFilterExpression: { activeSubmission: true } },
);
schema.index({ provider: 1, status: 1, appliedAt: -1 });
schema.index({ student: 1, appliedAt: -1 });
export default mongoose.model('Application', schema);
