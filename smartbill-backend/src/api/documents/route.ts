import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getDocuments, createDocument } from "@/services/documentsService";
import { addOcrJob } from "@/queues/ocrQueue";
import {
  documentQuerySchema,
  createDocumentSchema,
} from "@/utils/validation";
import { formatErrorResponse, AppError } from "@/utils/errors";

/**
 * GET /api/documents
 * List documents with filters and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth();

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    // Parse and validate query parameters
    const parsed = documentQuerySchema.parse({
      page: queryParams.page ? parseInt(queryParams.page) : 1,
      limit: queryParams.limit ? parseInt(queryParams.limit) : 20,
      sortBy: queryParams.sortBy || "createdAt",
      sortOrder: queryParams.sortOrder || "desc",
      supplierId: queryParams.supplierId,
      categoryId: queryParams.categoryId,
      status: queryParams.status,
      ocrStatus: queryParams.ocrStatus,
      from: queryParams.from,
      to: queryParams.to,
      search: queryParams.search,
    });

    const { page, limit, sortBy, sortOrder, ...filters } = parsed;

    const result = await getDocuments(
      userId,
      filters,
      { page, limit, sortBy, sortOrder }
    );

    return NextResponse.json(result);
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(
      errorResponse,
      { status: errorResponse.error.statusCode }
    );
  }
}

/**
 * POST /api/documents
 * Upload new document
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth();

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      throw new AppError("File is required", 400);
    }

    // Get form data
    const data = {
      supplierId: formData.get("supplierId") as string | undefined,
      categoryId: formData.get("categoryId") as string | undefined,
      invoiceNumber: formData.get("invoiceNumber") as string | undefined,
      issueDate: formData.get("issueDate") as string,
      dueDate: formData.get("dueDate") as string | undefined,
      totalAmount: parseFloat(formData.get("totalAmount") as string),
      vatAmount: formData.get("vatAmount")
        ? parseFloat(formData.get("vatAmount") as string)
        : undefined,
      currency: (formData.get("currency") as string) || "ILS",
      status: (formData.get("status") as any) || "PENDING",
      tags: formData.get("tags")
        ? JSON.parse(formData.get("tags") as string)
        : [],
      notes: formData.get("notes") as string | undefined,
    };

    // Validate data
    const validatedData = createDocumentSchema.parse(data);

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Create document
    const document = await createDocument(userId, validatedData, {
      buffer,
      originalName: file.name,
      size: file.size,
      mimetype: file.type,
    });

    // Queue OCR processing
    await addOcrJob({
      documentId: document.id,
      userId,
      fileUrl: document.fileUrl,
      fileType: document.fileType,
    });

    return NextResponse.json({ data: document }, { status: 201 });
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(
      errorResponse,
      { status: errorResponse.error.statusCode }
    );
  }
}
