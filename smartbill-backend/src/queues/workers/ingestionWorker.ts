import { Worker } from "bullmq";
import redis from "@/lib/redis";
import prisma from "@/lib/prisma";
import { getUserSettings } from "@/services/settingsService";
import { processGmailInbox } from "@/services/ingestion/gmail";
import { processImapInbox } from "@/services/ingestion/imap";
import { processWhatsAppMessage } from "@/services/ingestion/whatsapp";
import type { IngestionJobData } from "@/types";

/**
 * Ingestion Worker - Processes incoming documents from various sources
 */
const ingestionWorker = new Worker<IngestionJobData>(
  "ingestion",
  async (job) => {
    const { userId, source, messageId, attachmentData, metadata } = job.data;

    console.log(`Processing ingestion from ${source} for user ${userId}`);

    try {
      const settings = await getUserSettings(userId);
      let processedCount = 0;

      switch (source) {
        case "GMAIL":
          if (settings.gmailEnabled) {
            processedCount = await processGmailInbox(userId, settings);
            console.log(`Processed ${processedCount} Gmail messages`);
          } else {
            console.log("Gmail integration not enabled");
          }
          break;

        case "IMAP":
          if (settings.imapEnabled) {
            processedCount = await processImapInbox(userId, settings);
            console.log(`Processed ${processedCount} IMAP messages`);
          } else {
            console.log("IMAP integration not enabled");
          }
          break;

        case "WHATSAPP":
          if (metadata && metadata.message) {
            await processWhatsAppMessage(userId, metadata.message);
            processedCount = 1;
          } else {
            console.log("No WhatsApp message data provided");
          }
          break;

        case "EMAIL":
          // TODO: Implement inbound email ingestion (Mailgun/Postmark)
          console.log("Email ingestion not yet implemented");
          break;

        default:
          throw new Error(`Unknown source: ${source}`);
      }

      return { success: true, processed: processedCount };
    } catch (error) {
      console.error(`Ingestion failed for ${source}:`, error);
      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 3,
  }
);

ingestionWorker.on("completed", (job) => {
  console.log(`Ingestion job ${job.id} completed`);
});

ingestionWorker.on("failed", (job, err) => {
  console.error(`Ingestion job ${job?.id} failed:`, err);
});

export default ingestionWorker;

// Run worker if executed directly
if (require.main === module) {
  console.log("Ingestion Worker started");
}
