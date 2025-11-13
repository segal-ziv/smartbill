import { Queue } from "bullmq";
import redis from "@/lib/redis";
import type { OcrJobData } from "@/types";

export const ocrQueue = new Queue<OcrJobData>("ocr", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: {
      count: 100,
      age: 24 * 3600, // 24 hours
    },
    removeOnFail: {
      count: 500,
      age: 7 * 24 * 3600, // 7 days
    },
  },
});

/**
 * Add document to OCR processing queue
 */
export async function addOcrJob(data: OcrJobData) {
  return await ocrQueue.add("process", data, {
    jobId: `ocr-${data.documentId}`,
  });
}

export default ocrQueue;
