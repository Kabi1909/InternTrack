import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
export function generateToken(user) {
  return jwt.sign({ role: user.role, version: user.tokenVersion }, env.jwtSecret, {
    subject: String(user._id),
    expiresIn: env.jwtExpiry,
    algorithm: 'HS256',
    issuer: 'interntrack-api',
    audience: 'interntrack-client',
  });
}
