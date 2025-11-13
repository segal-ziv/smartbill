import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getUserSettings, updateUserSettings } from "@/services/settingsService";
import { updateSettingsSchema } from "@/utils/validation";
import { formatErrorResponse } from "@/utils/errors";

/**
 * GET /api/settings
 * Get user settings
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const settings = await getUserSettings(userId);

    return NextResponse.json({ data: settings });
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(
      errorResponse,
      { status: errorResponse.error.statusCode }
    );
  }
}

/**
 * PATCH /api/settings
 * Update user settings
 */
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const body = await request.json();

    const validatedData = updateSettingsSchema.parse(body);
    const settings = await updateUserSettings(userId, validatedData);

    return NextResponse.json({ data: settings });
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(
      errorResponse,
      { status: errorResponse.error.statusCode }
    );
  }
}
