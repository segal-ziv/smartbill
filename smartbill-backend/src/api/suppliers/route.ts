import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getSuppliers, createSupplier } from "@/services/suppliersService";
import { createSupplierSchema } from "@/utils/validation";
import { formatErrorResponse } from "@/utils/errors";

/**
 * GET /api/suppliers
 * List all suppliers
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const suppliers = await getSuppliers(userId);

    return NextResponse.json({ data: suppliers });
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(
      errorResponse,
      { status: errorResponse.error.statusCode }
    );
  }
}

/**
 * POST /api/suppliers
 * Create new supplier
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const body = await request.json();

    const validatedData = createSupplierSchema.parse(body);
    const supplier = await createSupplier(userId, validatedData);

    return NextResponse.json({ data: supplier }, { status: 201 });
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(
      errorResponse,
      { status: errorResponse.error.statusCode }
    );
  }
}
