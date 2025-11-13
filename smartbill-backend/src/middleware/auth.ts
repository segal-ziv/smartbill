import { Request, Response, NextFunction } from 'express';
import { clerkMiddleware } from '@clerk/express';
import { UnauthorizedError } from '../utils/errors';

// Extend Express Request to include auth data
declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string | null;
        sessionId?: string;
      };
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

/**
 * Clerk authentication middleware for Express
 * Verifies JWT tokens from Authorization header
 */
export const clerkAuth = clerkMiddleware();

/**
 * Require authentication middleware
 * Must be used after clerkAuth middleware
 * Throws UnauthorizedError if user is not authenticated
 */
export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    if (!req.auth?.userId) {
      throw new UnauthorizedError('Authentication required');
    }

    // Attach user information to request
    // In production, you might want to fetch additional user data from Clerk or your database
    req.user = {
      userId: req.auth.userId,
      email: `user-${req.auth.userId}@smartbill.com`, // Placeholder - should fetch from Clerk in production
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication middleware
 * Allows the request to proceed even if not authenticated
 * Attaches user data if authenticated
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    if (req.auth?.userId) {
      req.user = {
        userId: req.auth.userId,
        email: `user-${req.auth.userId}@smartbill.com`,
      };
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Helper to get authenticated user from request
 * Use this in route handlers to access user data
 */
export function getAuthUser(req: Request): { userId: string; email: string } {
  if (!req.user) {
    throw new UnauthorizedError('User not authenticated');
  }
  return req.user;
}
