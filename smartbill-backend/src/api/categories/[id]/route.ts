import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "@/services/categoriesService";
import { updateCategorySchema } from "@/utils/validation";
import { formatErrorResponse } from "@/utils/errors";

/**
 * GET /api/categories/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth();
    const category = await getCategoryById(params.id, userId);

    return NextResponse.json({ data: category });
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(
      errorResponse,
      { status: errorResponse.error.statusCode }
    );
  }
}

/**
 * PATCH /api/categories/[id]
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth();
    const body = await request.json();

    const validatedData = updateCategorySchema.parse(body);
    const category = await updateCategory(params.id, userId, validatedData);

    return NextResponse.json({ data: category });
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(
      errorResponse,
      { status: errorResponse.error.statusCode }
    );
  }
}

/**
 * DELETE /api/categories/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth();
    await deleteCategory(params.id, userId);

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(
      errorResponse,
      { status: errorResponse.error.statusCode }
    );
  }
}
