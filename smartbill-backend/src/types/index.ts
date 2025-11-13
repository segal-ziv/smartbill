import type { Document, Supplier, Category, BusinessSettings, User, AuditLog } from "@prisma/client";

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ApiErrorResponse {
  error: {
    message: string;
    code: string;
    statusCode: number;
    errors?: any[];
  };
}

// ============================================
// PAGINATION
// ============================================

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// DOCUMENT TYPES
// ============================================

export interface DocumentWithRelations extends Document {
  supplier?: Supplier | null;
  category?: Category | null;
}

export interface DocumentListItem {
  id: string;
  invoiceNumber: string | null;
  issueDate: Date;
  totalAmount: number;
  currency: string;
  status: string;
  ocrStatus: string;
  supplier: {
    id: string;
    name: string;
  } | null;
  category: {
    id: string;
    name: string;
    color: string | null;
  } | null;
  fileName: string;
  fileType: string;
  createdAt: Date;
}

// ============================================
// QUEUE JOB TYPES
// ============================================

export interface OcrJobData {
  documentId: string;
  userId: string;
  fileUrl: string;
  fileType: string;
}

export interface OcrResult {
  supplier?: {
    name: string;
    taxId?: string;
    confidence?: number;
  };
  invoiceNumber?: string;
  issueDate?: Date;
  totalAmount?: number;
  vatAmount?: number;
  lineItems?: Array<{
    description: string;
    amount: number;
    quantity?: number;
  }>;
  confidence: number;
  rawData: any;
}

export interface IngestionJobData {
  userId: string;
  source: "GMAIL" | "IMAP" | "WHATSAPP" | "EMAIL";
  messageId?: string;
  attachmentData?: Buffer;
  metadata?: any;
}

export interface ExportJobData {
  userId: string;
  from: Date;
  to: Date;
  supplierId?: string;
  categoryId?: string;
  status?: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";
  format: "excel" | "zip";
}

export interface ExportResult {
  fileUrl: string;
  expiresAt: Date;
  recordCount: number;
}

// ============================================
// STORAGE TYPES
// ============================================

export interface UploadFileResult {
  path: string;
  url: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

// ============================================
// SERVICE TYPES
// ============================================

export interface DocumentFilters {
  supplierId?: string;
  categoryId?: string;
  status?: string;
  ocrStatus?: string;
  from?: Date;
  to?: Date;
  search?: string;
}

export interface SupplierStats {
  totalDocuments: number;
  totalAmount: number;
  lastDocument?: Date;
}

export interface CategoryStats {
  totalDocuments: number;
  totalAmount?: number;
}

// ============================================
// AUDIT LOG
// ============================================

export interface AuditLogData {
  userId: string;
  documentId?: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "EXPORT" | "OCR_PROCESS";
  entityType: string;
  entityId?: string;
  changes?: any;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}

// ============================================
// RE-EXPORTS FROM PRISMA
// ============================================

export type {
  Document,
  Supplier,
  Category,
  BusinessSettings,
  User,
  AuditLog,
  OcrStatus,
  IngestionSource,
  DocumentStatus,
  OcrProvider,
  AuditAction,
} from "@prisma/client";
