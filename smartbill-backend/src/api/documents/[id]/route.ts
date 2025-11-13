import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  getDocumentById,
  updateDocument,
  deleteDocument,
  getDocumentFileUrl,
} from "@/services/documentsService";
import { updateDocumentSchema } from "@/utils/validation";
import { formatErrorResponse } from "@/utils/errors";

/**
 * GET /api/documents/[id]
 * Get single document
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth();
    const document = await getDocumentById(params.id, userId);

    // Get fresh signed URL for file
    const fileUrl = await getDocumentFileUrl(params.id, userId);

    return NextResponse.json({
      data: {
        ...document,
        fileUrl, // Override with fresh signed URL
      },
    });
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(
      errorResponse,
      { status: errorResponse.error.statusCode }
    );
  }
}

/**
 * PATCH /api/documents/[id]
 * Update document
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth();
    const body = await request.json();

    const validatedData = updateDocumentSchema.parse(body);
    const document = await updateDocument(params.id, userId, validatedData);

    return NextResponse.json({ data: document });
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(
      errorResponse,
      { status: errorResponse.error.statusCode }
    );
  }
}

/**
 * DELETE /api/documents/[id]
 * Delete document
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth();
    await deleteDocument(params.id, userId);

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(
      errorResponse,
      { status: errorResponse.error.statusCode }
    );
  }
}
