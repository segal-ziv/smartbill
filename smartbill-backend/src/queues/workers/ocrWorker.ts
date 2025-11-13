import { Worker } from "bullmq";
import axios from "axios";
import redis from "@/lib/redis";
import prisma from "@/lib/prisma";
import { supabase } from "@/lib/storage";
import { runOCR } from "@/services/ocr";
import { getUserSettings } from "@/services/settingsService";
import { createAuditLog } from "@/services/auditService";
import type { OcrJobData, OcrResult } from "@/types";

/**
 * OCR Worker - Processes document files and extracts data
 */
const ocrWorker = new Worker<OcrJobData>(
  "ocr",
  async (job) => {
    const { documentId, userId, fileUrl, fileType } = job.data;

    console.log(`Processing OCR for document ${documentId}`);

    try {
      // Update status to PROCESSING
      await prisma.document.update({
        where: { id: documentId },
        data: { ocrStatus: "PROCESSING" },
      });

      // Get user settings to determine OCR provider
      const settings = await getUserSettings(userId);
      const ocrProvider = settings.ocrProvider;

      // Download file from storage
      const fileBuffer = await downloadFile(fileUrl);

      // Run OCR
      const ocrResult = await runOCR(fileBuffer, ocrProvider);

      // Try to match supplier by name
      let supplierId: string | undefined;
      if (ocrResult.supplier?.name) {
        const matchedSupplier = await prisma.supplier.findFirst({
          where: {
            userId,
            OR: [
              { name: { contains: ocrResult.supplier.name, mode: "insensitive" } },
              { keywords: { hasSome: [ocrResult.supplier.name] } },
            ],
          },
        });
        supplierId = matchedSupplier?.id;
      }

      // Update document with OCR results
      const updateData: any = {
        ocrStatus: "COMPLETED",
        ocrData: ocrResult as any,
        ocrConfidence: ocrResult.confidence,
      };

      // Only update fields if they weren't manually set
      const currentDoc = await prisma.document.findUnique({
        where: { id: documentId },
        select: { invoiceNumber: true, totalAmount: true, vatAmount: true, issueDate: true },
      });

      if (!currentDoc?.invoiceNumber && ocrResult.invoiceNumber) {
        updateData.invoiceNumber = ocrResult.invoiceNumber;
      }
      if (supplierId) {
        updateData.supplierId = supplierId;
      }
      if (ocrResult.totalAmount) {
        updateData.totalAmount = ocrResult.totalAmount;
      }
      if (ocrResult.vatAmount) {
        updateData.vatAmount = ocrResult.vatAmount;
      }
      if (ocrResult.issueDate) {
        updateData.issueDate = ocrResult.issueDate;
      }

      await prisma.document.update({
        where: { id: documentId },
        data: updateData,
      });

      // Create audit log
      await createAuditLog({
        userId,
        documentId,
        action: "OCR_PROCESS",
        entityType: "Document",
        entityId: documentId,
        metadata: {
          provider: ocrProvider,
          confidence: ocrResult.confidence,
          extracted: {
            supplier: ocrResult.supplier?.name,
            amount: ocrResult.totalAmount,
            invoiceNumber: ocrResult.invoiceNumber,
          },
        },
      });

      console.log(`OCR completed for document ${documentId}`);

      return { success: true, result: ocrResult };
    } catch (error) {
      console.error(`OCR failed for document ${documentId}:`, error);

      // Update status to FAILED
      await prisma.document.update({
        where: { id: documentId },
        data: {
          ocrStatus: "FAILED",
          ocrData: {
            error: error instanceof Error ? error.message : "Unknown error",
          } as any,
        },
      });

      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 5,
    limiter: {
      max: 10,
      duration: 1000, // 10 jobs per second
    },
  }
);

/**
 * Download file from Supabase storage
 */
async function downloadFile(filePath: string): Promise<Buffer> {
  const { data, error } = await supabase.storage
    .from("documents")
    .download(filePath);

  if (error || !data) {
    throw new Error(`Failed to download file: ${error?.message}`);
  }

  return Buffer.from(await data.arrayBuffer());
}

ocrWorker.on("completed", (job) => {
  console.log(`OCR job ${job.id} completed`);
});

ocrWorker.on("failed", (job, err) => {
  console.error(`OCR job ${job?.id} failed:`, err);
});

export default ocrWorker;

// Run worker if executed directly
if (require.main === module) {
  console.log("OCR Worker started");
}
