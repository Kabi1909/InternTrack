import mongoose from 'mongoose';
import { ref, options } from './shared.js';
import { notificationTypes } from '../utils/constants.js';
const schema = new mongoose.Schema(
  {
    recipient: ref('User'),
    type: { type: String, enum: notificationTypes, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedJob: ref('Job', false),
    relatedApplication: ref('Application', false),
    relatedInterview: ref('Interview', false),
    isRead: { type: Boolean, default: false },
    dedupeKey: { type: String },
  },
  options(),
);
schema.index({ recipient: 1, createdAt: -1 });
schema.index({ dedupeKey: 1 }, { unique: true, sparse: true });
export default mongoose.model('Notification', schema);
