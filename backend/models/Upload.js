import mongoose from 'mongoose';
import { ref, options } from './shared.js';
const schema = new mongoose.Schema(
  {
    owner: ref('User'),
    originalName: String,
    storageKey: { type: String, select: false },
    mimeType: String,
    size: Number,
    driver: { type: String, enum: ['local', 'cloudinary'] },
    resourceType: String,
    kind: { type: String, enum: ['cv', 'image'], required: true },
  },
  options(),
);
export default mongoose.model('Upload', schema);
