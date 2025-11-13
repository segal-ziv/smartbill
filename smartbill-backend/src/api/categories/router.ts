import { Router } from 'express';
import {
  getCategories,
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '../../services/categoriesService';
import {
  createCategorySchema,
  updateCategorySchema,
} from '../../utils/validation';
import { asyncHandler } from '../../middleware/errorHandler';
import { clerkAuth, requireAuth, getAuthUser } from '../../middleware/auth';

const router = Router();

// Apply Clerk auth middleware to all routes
router.use(clerkAuth);
router.use(requireAuth);

/**
 * GET /api/categories
 * List all categories
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { userId } = getAuthUser(req);
    const categories = await getCategories(userId);

    res.json({ data: categories });
  })
);

/**
 * POST /api/categories
 * Create new category
 */
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { userId } = getAuthUser(req);

    const validatedData = createCategorySchema.parse(req.body);
    const category = await createCategory(userId, validatedData);

    res.status(201).json({ data: category });
  })
);

/**
 * GET /api/categories/:id
 * Get single category
 */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { userId } = getAuthUser(req);
    const { id } = req.params;

    const category = await getCategoryById(id, userId);

    res.json({ data: category });
  })
);

/**
 * PATCH /api/categories/:id
 * Update category
 */
router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const { userId } = getAuthUser(req);
    const { id } = req.params;

    const validatedData = updateCategorySchema.parse(req.body);
    const category = await updateCategory(id, userId, validatedData);

    res.json({ data: category });
  })
);

/**
 * DELETE /api/categories/:id
 * Delete category
 */
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { userId } = getAuthUser(req);
    const { id } = req.params;

    await deleteCategory(id, userId);

    res.json({ data: { success: true } });
  })
);

export { router as categoriesRouter };
