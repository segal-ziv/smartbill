import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatErrorResponse } from "@/utils/errors";

/**
 * GET /api/auth/me
 * Get current user info
 */
export async function GET(request: NextRequest) {
  try {
    const { userId, email } = await requireAuth();

    // Get or create user in database
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email,
        },
      });
    }

    return NextResponse.json({ data: user });
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(
      errorResponse,
      { status: errorResponse.error.statusCode }
    );
  }
}
