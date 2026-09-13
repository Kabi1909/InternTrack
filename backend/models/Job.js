import mongoose from 'mongoose';
import { ref, options } from './shared.js';
import { jobTypes, workModes, jobStatuses } from '../utils/constants.js';
const schema = new mongoose.Schema(
  {
    provider: { ...ref('User'), index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    company: { type: String, required: true, trim: true },
    description: { type: String, required: true, maxlength: 15000 },
    responsibilities: { type: String, default: '' },
    requiredSkills: [String],
    qualifications: { type: String, default: '' },
    jobType: { type: String, enum: jobTypes, required: true },
    workMode: { type: String, enum: workModes, required: true },
    location: { type: String, required: true },
    salaryMin: { type: Number, min: 0 },
    salaryMax: { type: Number, min: 0 },
    salaryText: { type: String, default: '' },
    applicationDeadline: { type: Date, required: true },
    numberOfPositions: { type: Number, default: 1, min: 1 },
    experienceRequirements: { type: String, default: '' },
    category: { type: String, required: true },
    status: { type: String, enum: jobStatuses, default: 'Active' },
    deletedAt: { type: Date, default: null },
  },
  options(),
);
schema.index({ status: 1, deletedAt: 1, applicationDeadline: 1, createdAt: -1 });
schema.index({ provider: 1, deletedAt: 1, createdAt: -1 });
export default mongoose.model('Job', schema);
