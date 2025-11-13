import { runGoogleVisionOCR } from "./googleVision";
import type { OcrResult, OcrProvider } from "@/types";

/**
 * Run OCR based on configured provider
 */
export async function runOCR(
  fileBuffer: Buffer,
  provider: OcrProvider = "GOOGLE_VISION"
): Promise<OcrResult> {
  switch (provider) {
    case "GOOGLE_VISION":
      return await runGoogleVisionOCR(fileBuffer);

    case "AWS_TEXTRACT":
      // TODO: Implement AWS Textract
      throw new Error("AWS Textract not yet implemented");

    default:
      throw new Error(`Unknown OCR provider: ${provider}`);
  }
}

export { runGoogleVisionOCR };
