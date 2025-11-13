// API Types based on Backend Schema

export type DocumentStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED"
export type OcrStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"
export type OcrProvider = "GOOGLE_VISION" | "AWS_TEXTRACT"

// User
export interface User {
  id: string
  email: string
  clerkId: string
  businessName: string | null
  createdAt: string
  updatedAt: string
}

// Supplier
export interface Supplier {
  id: string
  userId: string
  name: string
  taxId: string | null
  email: string | null
  phone: string | null
  address: string | null
  emailDomains: string[]
  keywords: string[]
  totalDocuments?: number
  totalAmount?: string
  createdAt: string
  updatedAt: string
}

export interface CreateSupplierInput {
  name: string
  taxId?: string
  email?: string
  phone?: string
  address?: string
  emailDomains?: string[]
  keywords?: string[]
}

export interface UpdateSupplierInput extends Partial<CreateSupplierInput> {}

// Category
export interface Category {
  id: string
  userId: string
  name: string
  color: string | null
  icon: string | null
  keywords: string[]
  totalDocuments?: number
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryInput {
  name: string
  color?: string
  icon?: string
  keywords?: string[]
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {}

// Document
export interface Document {
  id: string
  userId: string
  fileName: string
  filePath: string
  fileUrl?: string
  fileSize: number
  mimeType: string
  issueDate: string
  dueDate: string | null
  totalAmount: string
  vatAmount: string | null
  currency: string
  invoiceNumber: string | null
  status: DocumentStatus
  ocrStatus: OcrStatus
  ocrData: Record<string, any> | null
  ocrConfidence: number | null
  tags: string[]
  notes: string | null
  supplierId: string | null
  categoryId: string | null
  supplier?: Supplier
  category?: Category
  createdAt: string
  updatedAt: string
}

export interface CreateDocumentInput {
  file: File
  issueDate: string
  totalAmount: number
  supplierId?: string
  categoryId?: string
  invoiceNumber?: string
  dueDate?: string
  vatAmount?: number
  currency?: string
  status?: DocumentStatus
  tags?: string[]
  notes?: string
}

export interface UpdateDocumentInput {
  supplierId?: string
  categoryId?: string
  status?: DocumentStatus
  notes?: string
  invoiceNumber?: string
  issueDate?: string
  dueDate?: string
  totalAmount?: number
  vatAmount?: number
  tags?: string[]
}

// Business Settings
export interface BusinessSettings {
  id: string
  userId: string
  businessName: string | null
  businessType: string | null
  taxId: string | null
  address: string | null
  phone: string | null
  email: string | null
  gmailEnabled: boolean
  gmailAccessToken: string | null
  gmailRefreshToken: string | null
  gmailTokenExpiry: string | null
  imapEnabled: boolean
  imapHost: string | null
  imapPort: number | null
  imapUsername: string | null
  imapPassword: string | null
  whatsappEnabled: boolean
  whatsappAccessToken: string | null
  whatsappPhoneNumberId: string | null
  ocrProvider: OcrProvider
  ocrAutoProcess: boolean
  createdAt: string
  updatedAt: string
}

export interface UpdateSettingsInput {
  businessName?: string
  businessType?: string
  taxId?: string
  address?: string
  phone?: string
  email?: string
  gmailEnabled?: boolean
  imapEnabled?: boolean
  imapHost?: string
  imapPort?: number
  imapUsername?: string
  imapPassword?: string
  whatsappEnabled?: boolean
  ocrProvider?: OcrProvider
  ocrAutoProcess?: boolean
}

// Pagination
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

// API Response
export interface ApiResponse<T> {
  data: T
}

export interface ApiError {
  error: {
    message: string
    code: string
    statusCode: number
    errors?: any[]
  }
}

// Query Params
export interface DocumentsQueryParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
  supplierId?: string
  categoryId?: string
  status?: DocumentStatus
  ocrStatus?: OcrStatus
  from?: string
  to?: string
  search?: string
}

export interface ExportQueryParams {
  from: string
  to: string
  supplierId?: string
  categoryId?: string
  status?: DocumentStatus
}

export interface ExportResponse {
  fileUrl: string
  expiresAt: string
  recordCount: number
}
