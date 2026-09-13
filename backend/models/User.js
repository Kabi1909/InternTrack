import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { options } from './shared.js';
import { roles } from '../utils/constants.js';
const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: roles, required: true, immutable: true },
    profilePicture: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    tokenVersion: { type: Number, default: 0, select: false },
  },
  options(),
);
schema.pre('save', async function () {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 12);
});
schema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};
export default mongoose.model('User', schema);
