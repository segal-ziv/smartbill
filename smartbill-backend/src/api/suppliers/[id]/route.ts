import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} from "@/services/suppliersService";
import { updateSupplierSchema } from "@/utils/validation";
import { formatErrorResponse } from "@/utils/errors";

/**
 * GET /api/suppliers/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth();
    const supplier = await getSupplierById(params.id, userId);

    return NextResponse.json({ data: supplier });
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(
      errorResponse,
      { status: errorResponse.error.statusCode }
    );
  }
}

/**
 * PATCH /api/suppliers/[id]
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth();
    const body = await request.json();

    const validatedData = updateSupplierSchema.parse(body);
    const supplier = await updateSupplier(params.id, userId, validatedData);

    return NextResponse.json({ data: supplier });
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(
      errorResponse,
      { status: errorResponse.error.statusCode }
    );
  }
}

/**
 * DELETE /api/suppliers/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth();
    await deleteSupplier(params.id, userId);

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(
      errorResponse,
      { status: errorResponse.error.statusCode }
    );
  }
}
