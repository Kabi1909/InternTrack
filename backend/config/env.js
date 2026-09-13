import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)), quiet: true });
export const rootDir = fileURLToPath(new URL('../', import.meta.url));
export const env = {
  port: Number(process.env.PORT || 5000),
  mode: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiry: process.env.JWT_EXPIRES_IN || '7d',
  origins: (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((value) => value.trim()),
  uploadDriver: process.env.UPLOAD_DRIVER || 'local',
  uploadDir: path.join(rootDir, 'uploads'),
};
export function validateEnv() {
  if (!env.mongoUri) throw new Error('MONGO_URI is required. Configure backend/.env.');
  if (!env.jwtSecret || Buffer.byteLength(env.jwtSecret) < 32)
    throw new Error('JWT_SECRET must contain at least 32 bytes.');
  if (!['local', 'cloudinary'].includes(env.uploadDriver))
    throw new Error('UPLOAD_DRIVER must be local or cloudinary.');
}
