import prisma from "@/lib/prisma";
import { NotFoundError, ForbiddenError, handlePrismaError } from "@/utils/errors";
import { createAuditLog } from "./auditService";
import type { Supplier } from "@/types";
import type { CreateSupplierInput, UpdateSupplierInput } from "@/utils/validation";

/**
 * Get all suppliers for a user
 */
export async function getSuppliers(userId: string): Promise<Supplier[]> {
  return await prisma.supplier.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
}

/**
 * Get supplier by ID
 */
export async function getSupplierById(supplierId: string, userId: string): Promise<Supplier> {
  const supplier = await prisma.supplier.findUnique({
    where: { id: supplierId },
  });

  if (!supplier) {
    throw new NotFoundError("Supplier");
  }

  if (supplier.userId !== userId) {
    throw new ForbiddenError("You don't have access to this supplier");
  }

  return supplier;
}

/**
 * Create new supplier
 */
export async function createSupplier(
  userId: string,
  data: CreateSupplierInput
): Promise<Supplier> {
  try {
    const supplier = await prisma.supplier.create({
      data: {
        userId,
        name: data.name,
        taxId: data.taxId,
        email: data.email,
        phone: data.phone,
        address: data.address,
        emailDomains: data.emailDomains || [],
        keywords: data.keywords || [],
      },
    });

    await createAuditLog({
      userId,
      action: "CREATE",
      entityType: "Supplier",
      entityId: supplier.id,
    });

    return supplier;
  } catch (error: any) {
    throw handlePrismaError(error);
  }
}

/**
 * Update supplier
 */
export async function updateSupplier(
  supplierId: string,
  userId: string,
  data: UpdateSupplierInput
): Promise<Supplier> {
  await getSupplierById(supplierId, userId);

  try {
    const supplier = await prisma.supplier.update({
      where: { id: supplierId },
      data,
    });

    await createAuditLog({
      userId,
      action: "UPDATE",
      entityType: "Supplier",
      entityId: supplierId,
    });

    return supplier;
  } catch (error: any) {
    throw handlePrismaError(error);
  }
}

/**
 * Delete supplier
 */
export async function deleteSupplier(supplierId: string, userId: string): Promise<void> {
  await getSupplierById(supplierId, userId);

  try {
    await prisma.supplier.delete({
      where: { id: supplierId },
    });

    await createAuditLog({
      userId,
      action: "DELETE",
      entityType: "Supplier",
      entityId: supplierId,
    });
  } catch (error: any) {
    throw handlePrismaError(error);
  }
}

/**
 * Update supplier stats (called after document changes)
 */
export async function updateSupplierStats(supplierId: string): Promise<void> {
  const stats = await prisma.document.aggregate({
    where: { supplierId },
    _count: { id: true },
    _sum: { totalAmount: true },
  });

  await prisma.supplier.update({
    where: { id: supplierId },
    data: {
      totalDocuments: stats._count.id,
      totalAmount: stats._sum.totalAmount || 0,
    },
  });
}
