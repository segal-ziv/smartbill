import axios from "axios";
import prisma from "@/lib/prisma";
import { uploadFile } from "@/lib/storage";
import { addOcrJob } from "@/queues/ocrQueue";

interface WhatsAppMessage {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  image?: {
    id: string;
    mime_type: string;
    sha256: string;
  };
  document?: {
    id: string;
    filename: string;
    mime_type: string;
    sha256: string;
  };
}

/**
 * Process WhatsApp webhook message
 */
export async function processWhatsAppMessage(
  userId: string,
  message: WhatsAppMessage
): Promise<void> {
  if (!message.image && !message.document) {
    console.log("No media attachment in WhatsApp message");
    return;
  }

  const mediaId = message.image?.id || message.document?.id;
  if (!mediaId) return;

  try {
    // Download media from WhatsApp
    const { buffer, mimeType, filename } = await downloadWhatsAppMedia(mediaId);

    // Determine file type
    const ext = getExtensionFromMimeType(mimeType) || filename.split(".").pop() || "jpg";

    // Upload to storage
    const filePath = await uploadFile(buffer, filename, userId);

    // Create document record
    const document = await prisma.document.create({
      data: {
        userId,
        fileName: filename,
        fileUrl: filePath,
        fileType: ext,
        fileSize: buffer.length,
        source: "WHATSAPP",
        sourceMetadata: {
          whatsappId: message.id,
          from: message.from,
          timestamp: message.timestamp,
          mediaId,
        },
        issueDate: new Date(parseInt(message.timestamp) * 1000),
        totalAmount: 0,
        status: "PENDING",
        ocrStatus: "PENDING",
      },
    });

    // Queue for OCR
    await addOcrJob({
      documentId: document.id,
      userId,
      fileUrl: filePath,
      fileType: ext,
    });

    console.log(`Created document ${document.id} from WhatsApp`);
  } catch (error) {
    console.error("Failed to process WhatsApp message:", error);
    throw error;
  }
}

/**
 * Download media from WhatsApp Business API
 */
async function downloadWhatsAppMedia(
  mediaId: string
): Promise<{ buffer: Buffer; mimeType: string; filename: string }> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("WHATSAPP_ACCESS_TOKEN not configured");
  }

  try {
    // Step 1: Get media URL
    const mediaResponse = await axios.get(
      `https://graph.facebook.com/v18.0/${mediaId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const mediaUrl = mediaResponse.data.url;
    const mimeType = mediaResponse.data.mime_type;

    // Step 2: Download media
    const downloadResponse = await axios.get(mediaUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      responseType: "arraybuffer",
    });

    const buffer = Buffer.from(downloadResponse.data);
    const ext = getExtensionFromMimeType(mimeType) || "jpg";
    const filename = `whatsapp-${mediaId}.${ext}`;

    return {
      buffer,
      mimeType,
      filename,
    };
  } catch (error) {
    console.error("Failed to download WhatsApp media:", error);
    throw new Error("Failed to download media from WhatsApp");
  }
}

/**
 * Get file extension from MIME type
 */
function getExtensionFromMimeType(mimeType: string): string | null {
  const mimeMap: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "application/pdf": "pdf",
  };

  return mimeMap[mimeType.toLowerCase()] || null;
}

/**
 * Verify WhatsApp webhook signature
 */
export function verifyWhatsAppSignature(
  payload: string,
  signature: string
): boolean {
  const crypto = require("crypto");
  const secret = process.env.WHATSAPP_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error("WHATSAPP_WEBHOOK_SECRET not configured");
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return signature === `sha256=${expectedSignature}`;
}

/**
 * Verify WhatsApp webhook challenge (for initial setup)
 */
export function verifyWhatsAppChallenge(
  mode: string,
  token: string,
  challenge: string
): string | null {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (!verifyToken) {
    throw new Error("WHATSAPP_VERIFY_TOKEN not configured");
  }

  if (mode === "subscribe" && token === verifyToken) {
    return challenge;
  }

  return null;
}
