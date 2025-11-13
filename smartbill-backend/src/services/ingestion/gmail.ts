import { google } from "googleapis";
import prisma from "@/lib/prisma";
import { uploadFile } from "@/lib/storage";
import { addOcrJob } from "@/queues/ocrQueue";
import { updateGmailLastSync, updateGmailTokens } from "../settingsService";
import type { BusinessSettings } from "@/types";

const gmail = google.gmail("v1");

/**
 * Process Gmail inbox for new invoices
 */
export async function processGmailInbox(userId: string, settings: BusinessSettings): Promise<number> {
  if (!settings.gmailEnabled || !settings.gmailAccessToken || !settings.gmailRefreshToken) {
    throw new Error("Gmail integration not configured");
  }

  try {
    // Create OAuth client
    const oauth2Client = createOAuthClient();
    oauth2Client.setCredentials({
      access_token: settings.gmailAccessToken,
      refresh_token: settings.gmailRefreshToken,
    });

    // Refresh token if needed
    const tokenInfo = await oauth2Client.getAccessToken();
    if (tokenInfo.token && tokenInfo.token !== settings.gmailAccessToken) {
      const expiryDate = new Date(Date.now() + 3600 * 1000);
      await updateGmailTokens(
        userId,
        tokenInfo.token,
        settings.gmailRefreshToken,
        expiryDate
      );
    }

    // Search for messages with attachments since last sync
    const lastSync = settings.gmailLastSync || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const query = `has:attachment after:${Math.floor(lastSync.getTime() / 1000)} (filename:pdf OR filename:jpg OR filename:png OR filename:jpeg)`;

    const response = await gmail.users.messages.list({
      auth: oauth2Client,
      userId: "me",
      q: query,
      maxResults: 50,
    });

    const messages = response.data.messages || [];
    let processedCount = 0;

    for (const message of messages) {
      if (!message.id) continue;

      try {
        await processGmailMessage(userId, oauth2Client, message.id);
        processedCount++;
      } catch (error) {
        console.error(`Failed to process Gmail message ${message.id}:`, error);
      }
    }

    // Update last sync timestamp
    await updateGmailLastSync(userId);

    return processedCount;
  } catch (error) {
    console.error("Gmail ingestion error:", error);
    throw error;
  }
}

/**
 * Process a single Gmail message
 */
async function processGmailMessage(
  userId: string,
  oauth2Client: any,
  messageId: string
): Promise<void> {
  const message = await gmail.users.messages.get({
    auth: oauth2Client,
    userId: "me",
    id: messageId,
  });

  if (!message.data.payload) return;

  const parts = message.data.payload.parts || [];
  const headers = message.data.payload.headers || [];

  // Extract sender info
  const fromHeader = headers.find((h) => h.name?.toLowerCase() === "from");
  const subjectHeader = headers.find((h) => h.name?.toLowerCase() === "subject");
  const dateHeader = headers.find((h) => h.name?.toLowerCase() === "date");

  const from = fromHeader?.value || "";
  const subject = subjectHeader?.value || "";
  const receivedDate = dateHeader?.value ? new Date(dateHeader.value) : new Date();

  // Try to match supplier by email domain
  const emailMatch = from.match(/@([^>]+)/);
  const domain = emailMatch?.[1];

  let supplier = null;
  if (domain) {
    supplier = await prisma.supplier.findFirst({
      where: {
        userId,
        emailDomains: { has: domain },
      },
    });
  }

  // Process attachments
  for (const part of parts) {
    if (part.filename && part.body?.attachmentId) {
      const ext = part.filename.split(".").pop()?.toLowerCase();
      if (!ext || !["pdf", "jpg", "jpeg", "png"].includes(ext)) {
        continue;
      }

      // Download attachment
      const attachment = await gmail.users.messages.attachments.get({
        auth: oauth2Client,
        userId: "me",
        messageId,
        id: part.body.attachmentId,
      });

      if (!attachment.data.data) continue;

      // Decode base64
      const buffer = Buffer.from(attachment.data.data, "base64url");

      // Upload to storage
      const filePath = await uploadFile(buffer, part.filename, userId);

      // Create document record
      const document = await prisma.document.create({
        data: {
          userId,
          supplierId: supplier?.id,
          fileName: part.filename,
          fileUrl: filePath,
          fileType: ext,
          fileSize: buffer.length,
          source: "GMAIL",
          sourceMetadata: {
            messageId,
            from,
            subject,
            receivedDate,
          },
          issueDate: receivedDate,
          totalAmount: 0, // Will be filled by OCR
          status: "PENDING",
          ocrStatus: "PENDING",
        },
      });

      // Queue for OCR processing
      await addOcrJob({
        documentId: document.id,
        userId,
        fileUrl: filePath,
        fileType: ext,
      });

      console.log(`Created document ${document.id} from Gmail message ${messageId}`);
    }
  }
}

/**
 * Create Google OAuth client
 */
function createOAuthClient() {
  if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET) {
    throw new Error("Gmail OAuth credentials not configured");
  }

  return new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI || "http://localhost:3000/api/auth/gmail/callback"
  );
}

/**
 * Get Gmail OAuth URL for user authorization
 */
export function getGmailAuthUrl(): string {
  const oauth2Client = createOAuthClient();

  const scopes = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.modify",
  ];

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
  });
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeGmailCode(code: string) {
  const oauth2Client = createOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);

  return {
    accessToken: tokens.access_token!,
    refreshToken: tokens.refresh_token!,
    expiresAt: new Date(tokens.expiry_date || Date.now() + 3600 * 1000),
  };
}
