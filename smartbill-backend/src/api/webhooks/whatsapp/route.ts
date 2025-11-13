import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { verifyWhatsAppChallenge } from "@/services/ingestion/whatsapp";
import { addIngestionJob } from "@/queues/ingestionQueue";
import { formatErrorResponse } from "@/utils/errors";

/**
 * GET /api/webhooks/whatsapp
 * Verify WhatsApp webhook (initial setup)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    if (!mode || !token || !challenge) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }

    const verified = verifyWhatsAppChallenge(mode, token, challenge);

    if (verified) {
      return new NextResponse(verified, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    return NextResponse.json({ error: "Verification failed" }, { status: 403 });
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(
      errorResponse,
      { status: errorResponse.error.statusCode }
    );
  }
}

/**
 * POST /api/webhooks/whatsapp
 * Handle incoming WhatsApp messages
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // WhatsApp sends webhooks in this format
    if (body.object === "whatsapp_business_account") {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field === "messages") {
            const messages = change.value?.messages || [];

            for (const message of messages) {
              // Process each message
              if (message.type === "image" || message.type === "document") {
                // Extract phone number and find user
                const phoneNumber = change.value?.metadata?.phone_number_id;

                // Find user by WhatsApp phone number
                const { userId } = await requireAuth();

                // Queue for processing
                await addIngestionJob({
                  userId,
                  source: "WHATSAPP",
                  metadata: {
                    message,
                    phoneNumber,
                  },
                });

                console.log(`Queued WhatsApp message ${message.id} for processing`);
              }
            }
          }
        }
      }
    }

    // WhatsApp expects 200 response
    return NextResponse.json({ status: "received" }, { status: 200 });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);

    // Still return 200 to WhatsApp to avoid retries
    return NextResponse.json({ status: "error" }, { status: 200 });
  }
}
