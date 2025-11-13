import { Router } from 'express';
import {
  getSuppliers,
  createSupplier,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} from '../../services/suppliersService';
import {
  createSupplierSchema,
  updateSupplierSchema,
} from '../../utils/validation';
import { asyncHandler } from '../../middleware/errorHandler';
import { clerkAuth, requireAuth, getAuthUser } from '../../middleware/auth';

const router = Router();

// Apply Clerk auth middleware to all routes
router.use(clerkAuth);
router.use(requireAuth);

/**
 * GET /api/suppliers
 * List all suppliers
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { userId } = getAuthUser(req);
    const suppliers = await getSuppliers(userId);

    res.json({ data: suppliers });
  })
);

/**
 * POST /api/suppliers
 * Create new supplier
 */
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { userId } = getAuthUser(req);

    const validatedData = createSupplierSchema.parse(req.body);
    const supplier = await createSupplier(userId, validatedData);

    res.status(201).json({ data: supplier });
  })
);

/**
 * GET /api/suppliers/:id
 * Get single supplier
 */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { userId } = getAuthUser(req);
    const { id } = req.params;

    const supplier = await getSupplierById(id, userId);

    res.json({ data: supplier });
  })
);

/**
 * PATCH /api/suppliers/:id
 * Update supplier
 */
router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const { userId } = getAuthUser(req);
    const { id } = req.params;

    const validatedData = updateSupplierSchema.parse(req.body);
    const supplier = await updateSupplier(id, userId, validatedData);

    res.json({ data: supplier });
  })
);

/**
 * DELETE /api/suppliers/:id
 * Delete supplier
 */
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { userId } = getAuthUser(req);
    const { id } = req.params;

    await deleteSupplier(id, userId);

    res.json({ data: { success: true } });
  })
);

export { router as suppliersRouter };
