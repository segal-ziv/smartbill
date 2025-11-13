import { Queue } from "bullmq";
import redis from "@/lib/redis";
import type { IngestionJobData } from "@/types";

export const ingestionQueue = new Queue<IngestionJobData>("ingestion", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: {
      count: 100,
      age: 24 * 3600,
    },
    removeOnFail: {
      count: 500,
      age: 7 * 24 * 3600,
    },
  },
});

/**
 * Add ingestion job to queue
 */
export async function addIngestionJob(data: IngestionJobData) {
  return await ingestionQueue.add(data.source.toLowerCase(), data);
}

export default ingestionQueue;
