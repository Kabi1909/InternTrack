import ApiError from '../utils/ApiError.js';
export const notFound = (req, res, next) =>
  next(new ApiError(404, 'Endpoint not found.'));
export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  let status = error.statusCode || error.status || 500;
  let message = error.message;
  let errors = error.errors;
  if (error.code === 11000) {
    status = 409;
    message = 'This record already exists.';
    errors = undefined;
  }
  if (error.name === 'CastError') {
    status = 400;
    message = 'Invalid resource identifier.';
  }
  if (error.name === 'ValidationError') {
    status = 400;
    message = 'Validation failed';
    errors = Object.values(error.errors).map((item) => ({
      field: item.path,
      message: item.message,
    }));
  }
  if (error.name === 'MulterError') {
    status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    message =
      error.code === 'LIMIT_FILE_SIZE'
        ? 'File exceeds the 5 MB upload limit.'
        : 'Upload one file using the file field.';
  }
  if (status >= 500) {
    console.error('Request failed:', error.name, error.message);
    message = 'An unexpected server error occurred.';
    errors = undefined;
  }
  res
    .status(status)
    .json({ success: false, message, ...(Array.isArray(errors) ? { errors } : {}) });
}
