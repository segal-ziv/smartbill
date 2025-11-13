import { auth } from "@clerk/nextjs/server";

export interface AuthContext {
  userId: string;
  email: string;
}

/**
 * Requires authentication for API routes
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
