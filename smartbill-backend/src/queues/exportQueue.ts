import { Queue } from "bullmq";
import redis from "@/lib/redis";
import type { ExportJobData } from "@/types";

export const exportQueue = new Queue<ExportJobData>("export", {
  connection: redis,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: "fixed",
      delay: 3000,
    },
    removeOnComplete: {
      count: 50,
      age: 24 * 3600,
    },
    removeOnFail: {
      count: 100,
      age: 7 * 24 * 3600,
    },
  },
});

/**
 * Add export job to queue
 */
export async function addExportJob(data: ExportJobData) {
  return await exportQueue.add("export", data, {
    jobId: `export-${data.userId}-${Date.now()}`,
  });
}

export default exportQueue;
