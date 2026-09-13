import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import Upload from '../models/Upload.js';
import { env } from '../config/env.js';
import { getCloudinary } from '../config/cloudinary.js';
import ApiError from '../utils/ApiError.js';
function detect(buffer) {
  if (buffer.subarray(0, 5).toString() === '%PDF-') return ['application/pdf', '.pdf'];
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff)
    return ['image/jpeg', '.jpg'];
  if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])))
    return ['image/png', '.png'];
  if (
    buffer.subarray(0, 4).toString() === 'RIFF' &&
    buffer.subarray(8, 12).toString() === 'WEBP'
  )
    return ['image/webp', '.webp'];
  return [];
}
export async function storeFile(file, owner, kind) {
  if (!file) throw new ApiError(400, 'Upload one file using the file field.');
  const [mimeType, extension] = detect(file.buffer);
  if (
    !mimeType ||
    mimeType !== file.mimetype ||
    (kind === 'cv' ? mimeType !== 'application/pdf' : !mimeType.startsWith('image/'))
  )
    throw new ApiError(
      400,
      kind === 'cv'
        ? 'CV must be a valid PDF file.'
        : 'Image must be a valid JPEG, PNG, or WebP file.',
    );
  if (kind === 'image' && file.size > 2 * 1024 * 1024)
    throw new ApiError(413, 'Images must be smaller than 2 MB.');
  let storageKey = randomUUID() + extension;
  const resourceType = kind === 'cv' ? 'raw' : 'image';
  if (env.uploadDriver === 'cloudinary') {
    const cloud = getCloudinary();
    const result = await new Promise((resolve, reject) =>
      cloud.uploader
        .upload_stream(
          {
            resource_type: resourceType,
            type: kind === 'cv' ? 'authenticated' : 'upload',
            folder: 'interntrack',
            public_id: storageKey,
          },
          (error, result) => (error ? reject(error) : resolve(result)),
        )
        .end(file.buffer),
    );
    storageKey = result.public_id;
  } else {
    await fs.mkdir(env.uploadDir, { recursive: true });
    await fs.writeFile(path.join(env.uploadDir, storageKey), file.buffer, { flag: 'wx' });
  }
  try {
    return await Upload.create({
      owner,
      originalName: path
        .basename(file.originalname)
        .replace(/[^a-zA-Z0-9._ -]/g, '_')
        .slice(0, 150),
      storageKey,
      mimeType,
      size: file.size,
      kind,
      driver: env.uploadDriver,
      resourceType,
    });
  } catch (error) {
    if (env.uploadDriver === 'local')
      await fs.unlink(path.join(env.uploadDir, storageKey)).catch(() => {});
    throw error;
  }
}
