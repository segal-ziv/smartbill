import { Worker } from "bullmq";
import redis from "@/lib/redis";
import { exportDocuments, exportToExcel } from "@/services/exportService";
import type { ExportJobData } from "@/types";

/**
 * Export Worker - Generates Excel/ZIP files for document exports
 */
const exportWorker = new Worker<ExportJobData>(
  "export",
  async (job) => {
    const { userId, from, to, supplierId, categoryId, status, format } = job.data;

    console.log(`Processing export for user ${userId} (${format})`);

    try {
      const filters = {
        from,
        to,
        supplierId,
        categoryId,
        status,
      };

      let result;

      if (format === "zip") {
        result = await exportDocuments(userId, filters);
      } else {
        result = await exportToExcel(userId, filters);
      }

      console.log(`Export completed: ${result.recordCount} documents`);

      return result;
    } catch (error) {
      console.error(`Export failed for user ${userId}:`, error);
      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 2,
  }
);

exportWorker.on("completed", (job) => {
  console.log(`Export job ${job.id} completed`);
});

exportWorker.on("failed", (job, err) => {
  console.error(`Export job ${job?.id} failed:`, err);
});

export default exportWorker;

// Run worker if executed directly
if (require.main === module) {
  console.log("Export Worker started");
}
