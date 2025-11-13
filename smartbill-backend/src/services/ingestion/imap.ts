import Imap from "imap";
import { simpleParser } from "mailparser";
import prisma from "@/lib/prisma";
import { uploadFile } from "@/lib/storage";
import { addOcrJob } from "@/queues/ocrQueue";
import { updateImapLastSync } from "../settingsService";
import { decrypt } from "@/utils/encryption";
import type { BusinessSettings } from "@/types";

/**
 * Process IMAP inbox for new invoices
 */
export async function processImapInbox(userId: string, settings: BusinessSettings): Promise<number> {
  if (
    !settings.imapEnabled ||
    !settings.imapHost ||
    !settings.imapUsername ||
    !settings.imapPassword
  ) {
    throw new Error("IMAP integration not configured");
  }

  return new Promise((resolve, reject) => {
    let processedCount = 0;

    // Decrypt password (already validated above)
    const password = decrypt(settings.imapPassword!);

    // Create IMAP connection (all fields validated above)
    const imap = new Imap({
      user: settings.imapUsername!,
      password,
      host: settings.imapHost!,
      port: settings.imapPort || 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
    });

    imap.once("ready", () => {
      imap.openBox("INBOX", false, (err, box) => {
        if (err) {
          reject(err);
          return;
        }

        // Search for messages with attachments since last sync
        const lastSync = settings.imapLastSync || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const searchCriteria = ["UNSEEN", ["SINCE", lastSync]];

        imap.search(searchCriteria, (err, results) => {
          if (err) {
            reject(err);
            return;
          }

          if (!results || results.length === 0) {
            imap.end();
            resolve(0);
            return;
          }

          const fetch = imap.fetch(results, {
            bodies: "",
            struct: true,
          });

          fetch.on("message", (msg, seqno) => {
            msg.on("body", async (stream, info) => {
              try {
                const parsed = await simpleParser(stream as any);

                // Process attachments
                if (parsed.attachments && (parsed.attachments as any[]).length > 0) {
                  for (const attachment of parsed.attachments) {
                    const ext = attachment.filename?.split(".").pop()?.toLowerCase();
                    if (!ext || !["pdf", "jpg", "jpeg", "png"].includes(ext)) {
                      continue;
                    }

                    // Upload to storage
                    const filePath = await uploadFile(
                      attachment.content,
                      attachment.filename || `attachment-${Date.now()}.${ext}`,
                      userId
                    );

                    // Try to match supplier by email domain
                    const fromEmail = parsed.from?.value[0]?.address || "";
                    const domain = fromEmail.split("@")[1];

                    let supplier = null;
                    if (domain) {
                      supplier = await prisma.supplier.findFirst({
                        where: {
                          userId,
                          emailDomains: { has: domain },
                        },
                      });
                    }

                    // Create document record
                    const document = await prisma.document.create({
                      data: {
                        userId,
                        supplierId: supplier?.id,
                        fileName: attachment.filename || `attachment-${Date.now()}.${ext}`,
                        fileUrl: filePath,
                        fileType: ext,
                        fileSize: attachment.size || 0,
                        source: "IMAP",
                        sourceMetadata: {
                          from: fromEmail,
                          subject: parsed.subject,
                          date: parsed.date,
                        },
                        issueDate: parsed.date || new Date(),
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

                    processedCount++;
                    console.log(`Created document ${document.id} from IMAP`);
                  }
                }
              } catch (error) {
                console.error("Error processing IMAP message:", error);
              }
            });
          });

          fetch.once("error", (err) => {
            reject(err);
          });

          fetch.once("end", async () => {
            imap.end();
            await updateImapLastSync(userId);
            resolve(processedCount);
          });
        });
      });
    });

    imap.once("error", (err: Error) => {
      reject(err);
    });

    imap.connect();
  });
}
