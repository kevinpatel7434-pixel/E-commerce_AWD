import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import multer from 'multer';

const uploadDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../uploads/products');
mkdirSync(uploadDirectory, { recursive: true });

const imageTypes = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif'
};

class UnsupportedImageTypeError extends Error { }

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDirectory,
    filename: (req, file, callback) => callback(null, `${randomUUID()}${imageTypes[file.mimetype]}`)
  }),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, callback) => {
    if (!imageTypes[file.mimetype]) {
      callback(new UnsupportedImageTypeError('Upload a JPEG, PNG, WebP, or GIF image.'));
      return;
    }
    callback(null, true);
  }
});

export function uploadProductImage(req, res, next) {
  upload.single('imageFile')(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      res.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ message: error.message });
      return;
    }
    if (error instanceof UnsupportedImageTypeError) {
      res.status(400).json({ message: error.message });
      return;
    }
    if (error) return next(error);
    next();
  });
}
