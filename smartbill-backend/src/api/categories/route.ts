import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getCategories, createCategory } from "@/services/categoriesService";
import { createCategorySchema } from "@/utils/validation";
import { formatErrorResponse } from "@/utils/errors";

/**
 * GET /api/categories
 * List all categories
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const categories = await getCategories(userId);

    return NextResponse.json({ data: categories });
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(
      errorResponse,
      { status: errorResponse.error.statusCode }
    );
  }
}

/**
 * POST /api/categories
 * Create new category
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const body = await request.json();

    const validatedData = createCategorySchema.parse(body);
    const category = await createCategory(userId, validatedData);

    return NextResponse.json({ data: category }, { status: 201 });
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(
      errorResponse,
      { status: errorResponse.error.statusCode }
    );
  }
}
