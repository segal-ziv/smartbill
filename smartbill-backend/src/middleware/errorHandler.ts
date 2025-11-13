import { Request, Response, NextFunction } from 'express';
import { AppError, formatErrorResponse, handlePrismaError } from '../utils/errors';
import { Prisma } from '@prisma/client';

/**
 * Global Express error handling middleware
 * Catches all errors and formats them into consistent API responses
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // Log error in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Error caught in middleware:');
    console.error('Path:', req.method, req.path);
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }

  // Handle Prisma errors
  if (
    error instanceof Prisma.PrismaClientKnownRequestError ||
    error instanceof Prisma.PrismaClientValidationError
  ) {
    const appError = handlePrismaError(error);
    const response = formatErrorResponse(appError);
    return res.status(response.error.statusCode).json(response);
  }

  // Handle Zod validation errors
  if ((error as any)?.name === 'ZodError') {
    const response = formatErrorResponse(error);
    return res.status(response.error.statusCode).json(response);
  }

  // Handle Multer errors (file upload)
  if ((error as any)?.name === 'MulterError') {
    const multerError = error as any;
    let message = 'File upload error';

    if (multerError.code === 'LIMIT_FILE_SIZE') {
      message = 'File size exceeds the limit of 10MB';
    } else if (multerError.code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files';
    } else if (multerError.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Unexpected file field';
    }

    return res.status(400).json({
      error: {
        message,
        code: 'FILE_UPLOAD_ERROR',
        statusCode: 400,
      },
    });
  }

  // Handle Clerk authentication errors
  if ((error as any)?.clerkError) {
    return res.status(401).json({
      error: {
        message: 'Authentication failed',
        code: 'UNAUTHORIZED',
        statusCode: 401,
      },
    });
  }

  // Handle AppError instances
  if (error instanceof AppError) {
    const response = formatErrorResponse(error);
    return res.status(response.error.statusCode).json(response);
  }

  // Handle unknown errors
  const response = formatErrorResponse(error);

  // Log unexpected errors in production
  if (process.env.NODE_ENV === 'production') {
    console.error('Unexpected error:', {
      message: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
    });
  }

  return res.status(response.error.statusCode).json(response);
}

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors and pass them to the error handler
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
