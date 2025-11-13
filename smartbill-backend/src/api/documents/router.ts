import { Router } from 'express';
import {
  getDocuments,
  createDocument,
  getDocumentById,
  updateDocument,
  deleteDocument,
  getDocumentFileUrl,
} from '../../services/documentsService';
import { addOcrJob } from '../../queues/ocrQueue';
import {
  documentQuerySchema,
  createDocumentSchema,
  updateDocumentSchema,
} from '../../utils/validation';
import { asyncHandler } from '../../middleware/errorHandler';
import { clerkAuth, requireAuth, getAuthUser } from '../../middleware/auth';
import { uploadSingle, getUploadedFile } from '../../middleware/upload';

const router = Router();

// Apply Clerk auth middleware to all routes
router.use(clerkAuth);
router.use(requireAuth);

/**
 * GET /api/documents
 * List documents with filters and pagination
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { userId } = getAuthUser(req);

    // Parse and validate query parameters
    const parsed = documentQuerySchema.parse({
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc',
      supplierId: req.query.supplierId,
      categoryId: req.query.categoryId,
      status: req.query.status,
      ocrStatus: req.query.ocrStatus,
      from: req.query.from ? new Date(req.query.from as string) : undefined,
      to: req.query.to ? new Date(req.query.to as string) : undefined,
      search: req.query.search,
    });

    const { page, limit, sortBy, sortOrder, ...filters } = parsed;

    // Ensure from/to are Date objects (not strings)
    const cleanFilters = {
      ...filters,
      from: filters.from instanceof Date ? filters.from : undefined,
      to: filters.to instanceof Date ? filters.to : undefined,
    };

    const result = await getDocuments(userId, cleanFilters, {
      page,
      limit,
      sortBy,
      sortOrder,
    });

    res.json(result);
  })
);

/**
 * POST /api/documents
 * Upload new document
 */
router.post(
  '/',
  uploadSingle,
  asyncHandler(async (req, res) => {
    const { userId } = getAuthUser(req);

    // Get uploaded file
    const fileData = getUploadedFile(req);

    // Parse form data
    const data = {
      supplierId: req.body.supplierId || undefined,
      categoryId: req.body.categoryId || undefined,
      invoiceNumber: req.body.invoiceNumber || undefined,
      issueDate: req.body.issueDate,
      dueDate: req.body.dueDate || undefined,
      totalAmount: parseFloat(req.body.totalAmount),
      vatAmount: req.body.vatAmount ? parseFloat(req.body.vatAmount) : undefined,
      currency: req.body.currency || 'ILS',
      status: req.body.status || 'PENDING',
      tags: req.body.tags ? JSON.parse(req.body.tags) : [],
      notes: req.body.notes || undefined,
    };

    // Validate data
    const validatedData = createDocumentSchema.parse(data);

    // Create document
    const document = await createDocument(userId, validatedData, {
      buffer: fileData.buffer,
      originalName: fileData.originalName,
      size: fileData.size,
      mimetype: fileData.mimeType,
    });

    // Queue OCR processing
    await addOcrJob({
      documentId: document.id,
      userId,
      fileUrl: document.fileUrl,
      fileType: document.fileType,
    });

    res.status(201).json({ data: document });
  })
);

/**
 * GET /api/documents/:id
 * Get single document
 */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { userId } = getAuthUser(req);
    const { id } = req.params;

    const document = await getDocumentById(id, userId);

    // Get fresh signed URL for file
    const fileUrl = await getDocumentFileUrl(id, userId);

    res.json({
      data: {
        ...document,
        fileUrl, // Override with fresh signed URL
      },
    });
  })
);

/**
 * PATCH /api/documents/:id
 * Update document
 */
router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const { userId } = getAuthUser(req);
    const { id } = req.params;

    const validatedData = updateDocumentSchema.parse(req.body);
    const document = await updateDocument(id, userId, validatedData);

    res.json({ data: document });
  })
);

/**
 * DELETE /api/documents/:id
 * Delete document
 */
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { userId } = getAuthUser(req);
    const { id } = req.params;

    await deleteDocument(id, userId);

    res.json({ data: { success: true } });
  })
);

export { router as documentsRouter };
