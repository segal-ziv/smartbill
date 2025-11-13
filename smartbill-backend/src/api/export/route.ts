import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { exportToExcel } from "@/services/exportService";
import { exportQuerySchema } from "@/utils/validation";
import { formatErrorResponse, ValidationError } from "@/utils/errors";

/**
 * GET /api/export
 * Export documents to Excel
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth();

    const { searchParams } = new URL(request.url);

    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!from || !to) {
      throw new ValidationError("'from' and 'to' parameters are required");
    }

    const filters = exportQuerySchema.parse({
      from,
      to,
      supplierId: searchParams.get("supplierId") || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
      status: searchParams.get("status") || undefined,
    });

    const result = await exportToExcel(userId, filters);

    return NextResponse.json({ data: result });
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(
      errorResponse,
      { status: errorResponse.error.statusCode }
    );
  }
}
