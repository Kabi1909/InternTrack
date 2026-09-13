import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env } from '../config/env.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
export const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.get('Authorization');
  if (!header || !/^Bearer \S+$/.test(header))
    throw new ApiError(401, 'A valid Bearer token is required.');
  let payload;
  try {
    payload = jwt.verify(header.slice(7), env.jwtSecret, {
      algorithms: ['HS256'],
      issuer: 'interntrack-api',
      audience: 'interntrack-client',
    });
  } catch {
    throw new ApiError(401, 'Your session is invalid or expired. Please log in again.');
  }
  if (!/^[a-f\d]{24}$/i.test(payload.sub || ''))
    throw new ApiError(401, 'Invalid session.');
  const user = await User.findById(payload.sub).select('+tokenVersion');
  if (!user || !user.isActive || user.tokenVersion !== payload.version)
    throw new ApiError(401, 'Your session is no longer active.');
  // The database is authoritative for role and account status, not client input.
  req.user = user;
  next();
});
export const optionalAuth = (req, res, next) =>
  req.get('Authorization') ? authenticate(req, res, next) : next();
