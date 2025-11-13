import { Router } from 'express';
import prisma from '../../lib/prisma';
import { asyncHandler } from '../../middleware/errorHandler';
import { clerkAuth, requireAuth, getAuthUser } from '../../middleware/auth';

const router = Router();

// Apply Clerk auth middleware
router.use(clerkAuth);
router.use(requireAuth);

/**
 * GET /api/auth/me
 * Get current user info
 * Auto-creates user in database if doesn't exist
 */
router.get(
  '/me',
  asyncHandler(async (req, res) => {
    const { userId, email } = getAuthUser(req);

    // Get or create user in database
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email,
        },
      });
    }

    res.json({ data: user });
  })
);

export { router as authRouter };
