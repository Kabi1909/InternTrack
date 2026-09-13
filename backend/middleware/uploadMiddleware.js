import multer from 'multer';
import ApiError from '../utils/ApiError.js';
export const uploadFile = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 0 },
  fileFilter(req, file, done) {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    done(
      allowed.includes(file.mimetype)
        ? null
        : new ApiError(400, 'Upload a PDF, JPEG, PNG, or WebP file.'),
      allowed.includes(file.mimetype),
    );
  },
}).single('file');
