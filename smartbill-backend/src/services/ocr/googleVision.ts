import vision from "@google-cloud/vision";
import type { OcrResult } from "@/types";

const client = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

/**
 * Extract text from image using Google Vision API
 */
export async function runGoogleVisionOCR(fileBuffer: Buffer): Promise<OcrResult> {
  try {
    const [result] = await client.textDetection(fileBuffer);
    const detections = result.textAnnotations;

    if (!detections || detections.length === 0) {
      throw new Error("No text detected in image");
    }

    // Full text is in the first annotation
    const fullText = detections[0].description || "";

    // Parse invoice data from text
    const parsed = parseInvoiceText(fullText);

    return {
      ...parsed,
      confidence: result.textAnnotations?.[0]?.confidence || 0.5,
      rawData: {
        fullText,
        detections: detections.slice(0, 10), // First 10 detections
      },
    };
  } catch (error) {
    console.error("Google Vision OCR error:", error);
    throw new Error(`OCR processing failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Parse invoice information from OCR text
 */
function parseInvoiceText(text: string): Partial<OcrResult> {
  const lines = text.split("\n").map((l) => l.trim()).filter((l) => l);

  const result: Partial<OcrResult> = {
    supplier: undefined,
    invoiceNumber: undefined,
    issueDate: undefined,
    totalAmount: undefined,
    vatAmount: undefined,
    lineItems: [],
  };

  // Extract supplier (usually first few lines)
  const supplierMatch = extractSupplier(lines);
  if (supplierMatch) {
    result.supplier = {
      name: supplierMatch.name,
      taxId: supplierMatch.taxId,
      confidence: supplierMatch.confidence,
    };
  }

  // Extract invoice number
  const invoiceNumberMatch = text.match(/(?:invoice|חשבונית|מס[׳']|מספר)[\s:]*([A-Z0-9\-\/]+)/i);
  if (invoiceNumberMatch) {
    result.invoiceNumber = invoiceNumberMatch[1];
  }

  // Extract dates (ISO format or Israeli format)
  const dateMatch = text.match(/(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/);
  if (dateMatch) {
    result.issueDate = parseDate(dateMatch[1]);
  }

  // Extract amounts
  const amounts = extractAmounts(text);
  if (amounts.total) {
    result.totalAmount = amounts.total;
  }
  if (amounts.vat) {
    result.vatAmount = amounts.vat;
  }

  return result;
}

/**
 * Extract supplier information
 */
function extractSupplier(lines: string[]): { name: string; taxId?: string; confidence: number } | null {
  if (lines.length === 0) return null;

  // Take first 3 lines as potential supplier name
  const supplierName = lines.slice(0, 3).join(" ");

  // Look for tax ID (Israeli format: 9 digits)
  const taxIdMatch = supplierName.match(/\b(\d{9})\b/);

  return {
    name: lines[0], // First line is usually the company name
    taxId: taxIdMatch?.[1],
    confidence: 0.7,
  };
}

/**
 * Extract monetary amounts
 */
function extractAmounts(text: string): { total?: number; vat?: number } {
  const result: { total?: number; vat?: number } = {};

  // Look for total amount (various formats)
  const totalPatterns = [
    /(?:total|סה["׳]כ|סך הכל)[\s:]*(?:₪|ILS)?\s*([\d,]+\.?\d*)/i,
    /(?:לתשלום|לשלם)[\s:]*(?:₪|ILS)?\s*([\d,]+\.?\d*)/i,
  ];

  for (const pattern of totalPatterns) {
    const match = text.match(pattern);
    if (match) {
      const amount = parseFloat(match[1].replace(/,/g, ""));
      if (!isNaN(amount)) {
        result.total = amount;
        break;
      }
    }
  }

  // Look for VAT amount
  const vatPatterns = [
    /(?:vat|מע["׳]מ)[\s:]*(?:₪|ILS)?\s*([\d,]+\.?\d*)/i,
  ];

  for (const pattern of vatPatterns) {
    const match = text.match(pattern);
    if (match) {
      const amount = parseFloat(match[1].replace(/,/g, ""));
      if (!isNaN(amount)) {
        result.vat = amount;
        break;
      }
    }
  }

  return result;
}

/**
 * Parse date from various formats
 */
function parseDate(dateStr: string): Date | undefined {
  try {
    // Try Israeli format: DD/MM/YYYY or DD.MM.YYYY or DD-MM-YYYY
    const parts = dateStr.split(/[\/\-\.]/);
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; // JS months are 0-indexed
      const year = parseInt(parts[2]);

      // Handle 2-digit years
      const fullYear = year < 100 ? (year > 50 ? 1900 + year : 2000 + year) : year;

      const date = new Date(fullYear, month, day);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  } catch (error) {
    console.error("Date parsing error:", error);
  }

  return undefined;
}
