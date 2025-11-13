import ExcelJS from "exceljs";
import archiver from "archiver";
import { Readable } from "stream";
import prisma from "@/lib/prisma";
import { uploadFile, getSignedUrl } from "@/lib/storage";
import { createAuditLog } from "./auditService";
import type { ExportQueryInput } from "@/utils/validation";
import type { ExportResult } from "@/types";

/**
 * Export documents to Excel + ZIP
 */
export async function exportDocuments(
  userId: string,
  filters: ExportQueryInput
): Promise<ExportResult> {
  const where: any = {
    userId,
    issueDate: {
      gte: new Date(filters.from),
      lte: new Date(filters.to),
    },
  };

  if (filters.supplierId) where.supplierId = filters.supplierId;
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.status) where.status = filters.status;

  const documents = await prisma.document.findMany({
    where,
    include: {
      supplier: true,
      category: true,
    },
    orderBy: { issueDate: "asc" },
  });

  // Create Excel file
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Documents");

  // Add headers
  worksheet.columns = [
    { header: "Invoice Number", key: "invoiceNumber", width: 20 },
    { header: "Issue Date", key: "issueDate", width: 15 },
    { header: "Due Date", key: "dueDate", width: 15 },
    { header: "Supplier", key: "supplier", width: 25 },
    { header: "Category", key: "category", width: 20 },
    { header: "Total Amount", key: "totalAmount", width: 15 },
    { header: "VAT Amount", key: "vatAmount", width: 15 },
    { header: "Currency", key: "currency", width: 10 },
    { header: "Status", key: "status", width: 12 },
    { header: "File Name", key: "fileName", width: 30 },
  ];

  // Add data
  documents.forEach((doc) => {
    worksheet.addRow({
      invoiceNumber: doc.invoiceNumber || "",
      issueDate: doc.issueDate.toLocaleDateString(),
      dueDate: doc.dueDate?.toLocaleDateString() || "",
      supplier: doc.supplier?.name || "",
      category: doc.category?.name || "",
      totalAmount: Number(doc.totalAmount),
      vatAmount: doc.vatAmount ? Number(doc.vatAmount) : "",
      currency: doc.currency,
      status: doc.status,
      fileName: doc.fileName,
    });
  });

  // Style header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" },
  };

  // Generate Excel buffer
  const excelBuffer = await workbook.xlsx.writeBuffer();

  // Create ZIP with Excel and documents
  const archive = archiver("zip", { zlib: { level: 9 } });
  const chunks: Buffer[] = [];

  archive.on("data", (chunk) => chunks.push(chunk));

  // Add Excel file
  archive.append(Buffer.from(excelBuffer), { name: "documents.xlsx" });

  // TODO: Add document files to ZIP (requires downloading from storage)
  // For now, we'll just include the Excel

  await archive.finalize();

  const zipBuffer = Buffer.concat(chunks);

  // Upload ZIP to storage
  const timestamp = Date.now();
  const fileName = `export-${userId}-${timestamp}.zip`;
  const filePath = await uploadFile(zipBuffer, fileName, userId);

  // Get signed URL (valid for 1 hour)
  const fileUrl = await getSignedUrl(filePath, 3600);

  // Create audit log
  await createAuditLog({
    userId,
    action: "EXPORT",
    entityType: "Document",
    metadata: {
      recordCount: documents.length,
      filters,
    },
  });

  return {
    fileUrl,
    expiresAt: new Date(Date.now() + 3600 * 1000),
    recordCount: documents.length,
  };
}

/**
 * Export documents to Excel only (faster)
 */
export async function exportToExcel(
  userId: string,
  filters: ExportQueryInput
): Promise<ExportResult> {
  const where: any = {
    userId,
    issueDate: {
      gte: new Date(filters.from),
      lte: new Date(filters.to),
    },
  };

  if (filters.supplierId) where.supplierId = filters.supplierId;
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.status) where.status = filters.status;

  const documents = await prisma.document.findMany({
    where,
    include: {
      supplier: true,
      category: true,
    },
    orderBy: { issueDate: "asc" },
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Documents");

  worksheet.columns = [
    { header: "Invoice Number", key: "invoiceNumber", width: 20 },
    { header: "Issue Date", key: "issueDate", width: 15 },
    { header: "Due Date", key: "dueDate", width: 15 },
    { header: "Supplier", key: "supplier", width: 25 },
    { header: "Category", key: "category", width: 20 },
    { header: "Total Amount", key: "totalAmount", width: 15 },
    { header: "VAT Amount", key: "vatAmount", width: 15 },
    { header: "Currency", key: "currency", width: 10 },
    { header: "Status", key: "status", width: 12 },
  ];

  documents.forEach((doc) => {
    worksheet.addRow({
      invoiceNumber: doc.invoiceNumber || "",
      issueDate: doc.issueDate.toLocaleDateString(),
      dueDate: doc.dueDate?.toLocaleDateString() || "",
      supplier: doc.supplier?.name || "",
      category: doc.category?.name || "",
      totalAmount: Number(doc.totalAmount),
      vatAmount: doc.vatAmount ? Number(doc.vatAmount) : "",
      currency: doc.currency,
      status: doc.status,
    });
  });

  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" },
  };

  const buffer = await workbook.xlsx.writeBuffer();

  const timestamp = Date.now();
  const fileName = `export-${userId}-${timestamp}.xlsx`;
  const filePath = await uploadFile(Buffer.from(buffer), fileName, userId);

  const fileUrl = await getSignedUrl(filePath, 3600);

  await createAuditLog({
    userId,
    action: "EXPORT",
    entityType: "Document",
    metadata: {
      recordCount: documents.length,
      filters,
      format: "excel",
    },
  });

  return {
    fileUrl,
    expiresAt: new Date(Date.now() + 3600 * 1000),
    recordCount: documents.length,
  };
}
