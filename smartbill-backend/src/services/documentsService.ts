import prisma from "@/lib/prisma";
import { uploadFile, deleteFile, getSignedUrl } from "@/lib/storage";
import { NotFoundError, ForbiddenError, handlePrismaError } from "@/utils/errors";
import { createAuditLog } from "./auditService";
import type {
  DocumentWithRelations,
  DocumentFilters,
  PaginationParams,
  PaginatedResponse,
  UploadFileResult,
} from "@/types";
import type { CreateDocumentInput, UpdateDocumentInput } from "@/utils/validation";

/**
 * Get documents with filters and pagination
 */
export async function getDocuments(
  userId: string,
  filters: DocumentFilters = {},
  pagination: PaginationParams
): Promise<PaginatedResponse<DocumentWithRelations>> {
  const { page, limit, sortBy = "createdAt", sortOrder = "desc" } = pagination;
  const skip = (page - 1) * limit;

  const where: any = { userId };

  if (filters.supplierId) where.supplierId = filters.supplierId;
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.status) where.status = filters.status;
  if (filters.ocrStatus) where.ocrStatus = filters.ocrStatus;

  if (filters.from || filters.to) {
    where.issueDate = {};
    if (filters.from) where.issueDate.gte = filters.from;
    if (filters.to) where.issueDate.lte = filters.to;
  }

  if (filters.search) {
    where.OR = [
      { invoiceNumber: { contains: filters.search, mode: "insensitive" } },
      { notes: { contains: filters.search, mode: "insensitive" } },
      { supplier: { name: { contains: filters.search, mode: "insensitive" } } },
    ];
  }

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      include: {
        supplier: true,
        category: true,
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.document.count({ where }),
  ]);

  return {
    data: documents,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get single document by ID
 */
export async function getDocumentById(
  documentId: string,
  userId: string
): Promise<DocumentWithRelations> {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      supplier: true,
      category: true,
    },
  });

  if (!document) {
    throw new NotFoundError("Document");
  }

  if (document.userId !== userId) {
    throw new ForbiddenError("You don't have access to this document");
  }

  return document;
}

/**
 * Create new document with file upload
 */
export async function createDocument(
  userId: string,
  data: CreateDocumentInput,
  file: {
    buffer: Buffer;
    originalName: string;
    size: number;
    mimetype: string;
  }
): Promise<DocumentWithRelations> {
  try {
    // Upload file to storage
    const filePath = await uploadFile(file.buffer, file.originalName, userId);
    const fileUrl = await getSignedUrl(filePath);

    // Determine file type
    const fileType = file.mimetype.split("/")[1] || "unknown";

    // Create document record
    const document = await prisma.document.create({
      data: {
        userId,
        supplierId: data.supplierId,
        categoryId: data.categoryId,
        invoiceNumber: data.invoiceNumber,
        issueDate: new Date(data.issueDate),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        totalAmount: data.totalAmount,
        vatAmount: data.vatAmount,
        currency: data.currency,
        fileUrl: filePath,
        fileType,
        fileName: file.originalName,
        fileSize: file.size,
        source: "MANUAL",
        status: data.status,
        tags: data.tags,
        notes: data.notes,
        ocrStatus: "PENDING",
      },
      include: {
        supplier: true,
        category: true,
      },
    });

    // Create audit log
    await createAuditLog({
      userId,
      documentId: document.id,
      action: "CREATE",
      entityType: "Document",
      entityId: document.id,
      metadata: { fileName: file.originalName },
    });

    return document;
  } catch (error: any) {
    throw handlePrismaError(error);
  }
}

/**
 * Update document
 */
export async function updateDocument(
  documentId: string,
  userId: string,
  data: UpdateDocumentInput
): Promise<DocumentWithRelations> {
  // Check ownership
  const existing = await getDocumentById(documentId, userId);

  try {
    const updateData: any = {};

    if (data.supplierId !== undefined) updateData.supplierId = data.supplierId;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.invoiceNumber !== undefined) updateData.invoiceNumber = data.invoiceNumber;
    if (data.issueDate) updateData.issueDate = new Date(data.issueDate);
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.totalAmount) updateData.totalAmount = data.totalAmount;
    if (data.vatAmount !== undefined) updateData.vatAmount = data.vatAmount;
    if (data.currency) updateData.currency = data.currency;
    if (data.status) updateData.status = data.status;
    if (data.tags) updateData.tags = data.tags;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const document = await prisma.document.update({
      where: { id: documentId },
      data: updateData,
      include: {
        supplier: true,
        category: true,
      },
    });

    // Create audit log
    await createAuditLog({
      userId,
      documentId,
      action: "UPDATE",
      entityType: "Document",
      entityId: documentId,
      changes: { before: existing, after: document },
    });

    return document;
  } catch (error: any) {
    throw handlePrismaError(error);
  }
}

/**
 * Delete document
 */
export async function deleteDocument(documentId: string, userId: string): Promise<void> {
  const document = await getDocumentById(documentId, userId);

  try {
    // Delete file from storage
    await deleteFile(document.fileUrl);

    // Delete from database
    await prisma.document.delete({
      where: { id: documentId },
    });

    // Create audit log
    await createAuditLog({
      userId,
      documentId,
      action: "DELETE",
      entityType: "Document",
      entityId: documentId,
      metadata: { fileName: document.fileName },
    });
  } catch (error: any) {
    throw handlePrismaError(error);
  }
}

/**
 * Get document file URL
 */
export async function getDocumentFileUrl(
  documentId: string,
  userId: string
): Promise<string> {
  const document = await getDocumentById(documentId, userId);
  return await getSignedUrl(document.fileUrl);
}
