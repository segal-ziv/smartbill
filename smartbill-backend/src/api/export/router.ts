import { Router } from 'express';
import { exportToExcel } from '../../services/exportService';
import { exportQuerySchema } from '../../utils/validation';
import { ValidationError } from '../../utils/errors';
import { asyncHandler } from '../../middleware/errorHandler';
import { clerkAuth, requireAuth, getAuthUser } from '../../middleware/auth';

const router = Router();

// Apply Clerk auth middleware
router.use(clerkAuth);
router.use(requireAuth);

/**
 * GET /api/export
 * Export documents to Excel
 * Query params: from, to, supplierId?, categoryId?, status?
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { userId } = getAuthUser(req);

    const from = req.query.from as string;
    const to = req.query.to as string;

    if (!from || !to) {
      throw new ValidationError("'from' and 'to' parameters are required");
    }

    const filters = exportQuerySchema.parse({
      from,
      to,
      supplierId: req.query.supplierId || undefined,
      categoryId: req.query.categoryId || undefined,
      status: req.query.status || undefined,
    });

    const result = await exportToExcel(userId, filters);

    res.json({ data: result });
  })
);

export { router as exportRouter };
