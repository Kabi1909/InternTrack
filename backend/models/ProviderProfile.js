import mongoose from 'mongoose';
import { ref, options } from './shared.js';
const schema = new mongoose.Schema(
  {
    user: { ...ref('User'), unique: true },
    companyName: { type: String, trim: true, default: '' },
    companyLogo: { type: String, default: '' },
    companyDescription: { type: String, default: '' },
    website: { type: String, default: '' },
    industry: { type: String, default: '' },
    location: { type: String, default: '' },
    contactEmail: { type: String, lowercase: true, trim: true, default: '' },
  },
  options(),
);
export default mongoose.model('ProviderProfile', schema);
