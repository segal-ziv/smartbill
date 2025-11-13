import { Router } from 'express';
import { getUserSettings, updateUserSettings } from '../../services/settingsService';
import { updateSettingsSchema } from '../../utils/validation';
import { asyncHandler } from '../../middleware/errorHandler';
import { clerkAuth, requireAuth, getAuthUser } from '../../middleware/auth';

const router = Router();

// Apply Clerk auth middleware
router.use(clerkAuth);
router.use(requireAuth);

/**
 * GET /api/settings
 * Get user settings
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { userId } = getAuthUser(req);
    const settings = await getUserSettings(userId);

    res.json({ data: settings });
  })
);

/**
 * PATCH /api/settings
 * Update user settings
 */
router.patch(
  '/',
  asyncHandler(async (req, res) => {
    const { userId } = getAuthUser(req);

    const validatedData = updateSettingsSchema.parse(req.body);
    const settings = await updateUserSettings(userId, validatedData);

    res.json({ data: settings });
  })
);

export { router as settingsRouter };
