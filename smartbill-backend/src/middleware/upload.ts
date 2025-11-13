import multer from 'multer';
import { Request } from 'express';
import { ValidationError } from '../utils/errors';

/**
 * Allowed file types for document uploads
 */
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'];

/**
 * Maximum file size: 10MB
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

/**
 * Multer configuration for file uploads
 * Files are stored in memory as Buffer objects
 */
const storage = multer.memoryStorage();

/**
 * File filter function
 * Validates file type and extension
 */
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
) => {
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return callback(
      new ValidationError(
        `Invalid file type. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`
      )
    );
  }

  // Check file extension
  const extension = '.' + file.originalname.split('.').pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return callback(
      new ValidationError(
        `Invalid file extension. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`
      )
    );
  }

  callback(null, true);
};

/**
 * Multer instance for single file uploads
 * Field name: 'file'
 */
export const uploadSingle = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter,
}).single('file');

/**
 * Multer instance for multiple file uploads
 * Field name: 'files'
 * Max files: 10
 */
export const uploadMultiple = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10,
  },
  fileFilter,
}).array('files', 10);

/**
 * Helper to validate uploaded file exists
 */
export function validateFileExists(file: Express.Multer.File | undefined): asserts file is Express.Multer.File {
  if (!file) {
    throw new ValidationError('No file uploaded');
  }
}

/**
 * Helper to get file data from request
 */
export function getUploadedFile(req: Request): {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
} {
  validateFileExists(req.file);

  return {
    buffer: req.file.buffer,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
  };
}
