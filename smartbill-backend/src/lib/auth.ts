/**
 * @deprecated This file contains legacy Next.js authentication utilities.
 * For Express routes, use the middleware from src/middleware/auth.ts instead.
 *
 * This file is kept for backward compatibility with any remaining Next.js routes
 * or shared code that might still reference it.
 */

import { auth } from "@clerk/nextjs/server";

export interface AuthContext {
  userId: string;
  email: string;
}

/**
 * @deprecated Use Express middleware from src/middleware/auth.ts instead
 * Requires authentication for Next.js API routes
 * @throws {Error} If user is not authenticated
 */
export async function requireAuth(): Promise<AuthContext> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // In production, fetch email from Clerk
  // For now, we'll use a placeholder
  const email = `user-${userId}@smartbill.com`;

  return { userId, email };
}

/**
 * @deprecated Use Express middleware from src/middleware/auth.ts instead
 * Optional authentication - returns null if not authenticated
 */
export async function optionalAuth(): Promise<AuthContext | null> {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const email = `user-${userId}@smartbill.com`;
  return { userId, email };
}
