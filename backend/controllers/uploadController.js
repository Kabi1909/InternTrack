import path from 'node:path';
import Upload from '../models/Upload.js';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import ProviderProfile from '../models/ProviderProfile.js';
import Application from '../models/Application.js';
import ApiError from '../utils/ApiError.js';
import { success } from '../utils/response.js';
import { storeFile } from '../services/uploadService.js';
import { env } from '../config/env.js';
import { getCloudinary } from '../config/cloudinary.js';
export const upload = (kind) => async (req, res) => {
  const file = await storeFile(req.file, req.user.id, kind);
  const url = `/api/uploads/${file.id}`;
  if (kind === 'cv')
    await StudentProfile.updateOne(
      { user: req.user.id },
      { $set: { cvUrl: url, cvUpload: file.id } },
    );
  else if (req.user.role === 'student')
    await Promise.all([
      StudentProfile.updateOne({ user: req.user.id }, { $set: { profilePicture: url } }),
      User.updateOne({ _id: req.user.id }, { $set: { profilePicture: url } }),
    ]);
  else
    await ProviderProfile.updateOne(
      { user: req.user.id },
      { $set: { companyLogo: url } },
    );
  success(
    res,
    {
      id: file.id,
      url,
      name: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
    },
    'File uploaded.',
    201,
  );
};
export async function download(req, res) {
  const file = await Upload.findById(req.params.id).select('+storageKey');
  if (!file) throw new ApiError(404, 'File not found.');
  if (file.kind === 'cv') {
    if (!req.user)
      throw new ApiError(401, 'Authentication is required to download a CV.');
    const permitted =
      String(file.owner) === req.user.id ||
      (req.user.role === 'provider' &&
        (await Application.exists({ provider: req.user.id, cvUpload: file.id })));
    if (!permitted) throw new ApiError(404, 'File not found.');
    res.set('Cache-Control', 'private, no-store');
  }
  if (file.driver === 'cloudinary') {
    const cloud = getCloudinary();
    const url =
      file.kind === 'cv'
        ? cloud.utils.private_download_url(file.storageKey, '', {
            resource_type: 'raw',
            type: 'authenticated',
            expires_at: Math.floor(Date.now() / 1000) + 60,
          })
        : cloud.url(file.storageKey, { secure: true });
    return res.redirect(url);
  }
  if (path.basename(file.storageKey) !== file.storageKey)
    throw new ApiError(404, 'File not found.');
  res.type(file.mimeType);
  if (file.kind === 'cv') res.attachment(file.originalName);
  res.sendFile(file.storageKey, { root: env.uploadDir, dotfiles: 'deny' }, (error) => {
    if (error && !res.headersSent)
      res.status(404).json({ success: false, message: 'File not found.' });
  });
}
