import prisma from "@/lib/prisma";
import { NotFoundError, ForbiddenError, handlePrismaError } from "@/utils/errors";
import { createAuditLog } from "./auditService";
import type { Category } from "@/types";
import type { CreateCategoryInput, UpdateCategoryInput } from "@/utils/validation";

/**
 * Get all categories for a user
 */
export async function getCategories(userId: string): Promise<Category[]> {
  return await prisma.category.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
}

/**
 * Get category by ID
 */
export async function getCategoryById(categoryId: string, userId: string): Promise<Category> {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new NotFoundError("Category");
  }

  if (category.userId !== userId) {
    throw new ForbiddenError("You don't have access to this category");
  }

  return category;
}

/**
 * Create new category
 */
export async function createCategory(
  userId: string,
  data: CreateCategoryInput
): Promise<Category> {
  try {
    const category = await prisma.category.create({
      data: {
        userId,
        name: data.name,
        color: data.color,
        icon: data.icon,
        keywords: data.keywords || [],
      },
    });

    await createAuditLog({
      userId,
      action: "CREATE",
      entityType: "Category",
      entityId: category.id,
    });

    return category;
  } catch (error: any) {
    throw handlePrismaError(error);
  }
}

/**
 * Update category
 */
export async function updateCategory(
  categoryId: string,
  userId: string,
  data: UpdateCategoryInput
): Promise<Category> {
  await getCategoryById(categoryId, userId);

  try {
    const category = await prisma.category.update({
      where: { id: categoryId },
      data,
    });

    await createAuditLog({
      userId,
      action: "UPDATE",
      entityType: "Category",
      entityId: categoryId,
    });

    return category;
  } catch (error: any) {
    throw handlePrismaError(error);
  }
}

/**
 * Delete category
 */
export async function deleteCategory(categoryId: string, userId: string): Promise<void> {
  await getCategoryById(categoryId, userId);

  try {
    await prisma.category.delete({
      where: { id: categoryId },
    });

    await createAuditLog({
      userId,
      action: "DELETE",
      entityType: "Category",
      entityId: categoryId,
    });
  } catch (error: any) {
    throw handlePrismaError(error);
  }
}

/**
 * Update category stats (called after document changes)
 */
export async function updateCategoryStats(categoryId: string): Promise<void> {
  const count = await prisma.document.count({
    where: { categoryId },
  });

  await prisma.category.update({
    where: { id: categoryId },
    data: {
      totalDocuments: count,
    },
  });
}
