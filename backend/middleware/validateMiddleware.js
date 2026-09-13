import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';
export function validate(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty())
    return next(
      new ApiError(
        400,
        'Validation failed',
        result
          .array({ onlyFirstError: true })
          .map((error) => ({ field: error.path, message: error.msg })),
      ),
    );
  next();
}
export function rejectUnsafeKeys(req, res, next) {
  const walk = (value) => {
    if (!value || typeof value !== 'object') return;
    for (const key of Object.keys(value)) {
      if (
        key.startsWith('$') ||
        key.includes('.') ||
        ['__proto__', 'constructor', 'prototype'].includes(key)
      )
        throw new ApiError(400, 'Unsupported request field.');
      walk(value[key]);
    }
  };
  try {
    walk(req.body);
    walk(req.query);
    next();
  } catch (error) {
    next(error);
  }
}
