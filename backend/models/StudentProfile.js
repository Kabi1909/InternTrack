import mongoose from 'mongoose';
import { ref, options } from './shared.js';
const schema = new mongoose.Schema(
  {
    user: { ...ref('User'), unique: true },
    phone: { type: String, default: '' },
    university: { type: String, default: '' },
    degree: { type: String, default: '' },
    graduationYear: Number,
    skills: { type: [String], default: [] },
    preferredJobRoles: { type: [String], default: [] },
    preferredWorkLocation: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    cvUrl: { type: String, default: '' },
    cvUpload: ref('Upload', false),
    profilePicture: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 3000 },
  },
  options(),
);
export default mongoose.model('StudentProfile', schema);
