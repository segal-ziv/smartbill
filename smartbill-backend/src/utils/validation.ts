import { z } from "zod";

// ============================================
// DOCUMENT SCHEMAS
// ============================================

export const createDocumentSchema = z.object({
  supplierId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  invoiceNumber: z.string().optional(),
  issueDate: z.string().datetime().or(z.date()),
  dueDate: z.string().datetime().or(z.date()).optional(),
  totalAmount: z.number().positive(),
  vatAmount: z.number().nonnegative().optional(),
  currency: z.string().default("ILS"),
  status: z.enum(["DRAFT", "PENDING", "APPROVED", "REJECTED"]).default("PENDING"),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

export const updateDocumentSchema = z.object({
  supplierId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  invoiceNumber: z.string().optional(),
  issueDate: z.string().datetime().or(z.date()).optional(),
  dueDate: z.string().datetime().or(z.date()).optional().nullable(),
  totalAmount: z.number().positive().optional(),
  vatAmount: z.number().nonnegative().optional().nullable(),
  currency: z.string().optional(),
  status: z.enum(["DRAFT", "PENDING", "APPROVED", "REJECTED"]).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional().nullable(),
});

// ============================================
// SUPPLIER SCHEMAS
// ============================================

export const createSupplierSchema = z.object({
  name: z.string().min(1).max(200),
  taxId: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  emailDomains: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
});

export const updateSupplierSchema = createSupplierSchema.partial();

// ============================================
// CATEGORY SCHEMAS
// ============================================

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().optional(),
  keywords: z.array(z.string()).default([]),
});

export const updateCategorySchema = createCategorySchema.partial();

// ============================================
// SETTINGS SCHEMAS
// ============================================

export const updateSettingsSchema = z.object({
  businessName: z.string().optional(),
  taxId: z.string().optional(),
  address: z.string().optional(),

  // Gmail
  gmailEnabled: z.boolean().optional(),
  gmailSyncFrequency: z.number().int().min(5).optional(),

  // IMAP
  imapEnabled: z.boolean().optional(),
  imapHost: z.string().optional(),
  imapPort: z.number().int().min(1).max(65535).optional(),
  imapUsername: z.string().optional(),
  imapPassword: z.string().optional(),
  imapSyncFrequency: z.number().int().min(5).optional(),

  // WhatsApp
  whatsappEnabled: z.boolean().optional(),
  whatsappPhoneNumber: z.string().optional(),

  // OCR
  ocrProvider: z.enum(["GOOGLE_VISION", "AWS_TEXTRACT"]).optional(),
  ocrAutoProcess: z.boolean().optional(),

  // Export
  defaultExportFormat: z.string().optional(),
  includeAttachments: z.boolean().optional(),
});

// ============================================
// EXPORT SCHEMAS
// ============================================

export const exportQuerySchema = z.object({
  from: z.string().datetime().or(z.date()),
  to: z.string().datetime().or(z.date()),
  supplierId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  status: z.enum(["DRAFT", "PENDING", "APPROVED", "REJECTED"]).optional(),
});

// ============================================
// PAGINATION SCHEMAS
// ============================================

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// ============================================
// QUERY FILTERS
// ============================================

export const documentQuerySchema = paginationSchema.extend({
  supplierId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  status: z.enum(["DRAFT", "PENDING", "APPROVED", "REJECTED"]).optional(),
  ocrStatus: z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED"]).optional(),
  from: z.string().datetime().or(z.date()).optional(),
  to: z.string().datetime().or(z.date()).optional(),
  search: z.string().optional(),
});

// Type exports
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type ExportQueryInput = z.infer<typeof exportQuerySchema>;
export type DocumentQueryInput = z.infer<typeof documentQuerySchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
