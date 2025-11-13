import prisma from "@/lib/prisma";
import { encrypt, decrypt } from "@/utils/encryption";
import { NotFoundError, handlePrismaError } from "@/utils/errors";
import { createAuditLog } from "./auditService";
import type { BusinessSettings } from "@/types";
import type { UpdateSettingsInput } from "@/utils/validation";

/**
 * Get or create user settings
 */
export async function getUserSettings(userId: string): Promise<BusinessSettings> {
  let settings = await prisma.businessSettings.findUnique({
    where: { userId },
  });

  if (!settings) {
    settings = await prisma.businessSettings.create({
      data: { userId },
    });
  }

  // Decrypt sensitive fields
  if (settings.gmailAccessToken) {
    settings.gmailAccessToken = decrypt(settings.gmailAccessToken);
  }
  if (settings.gmailRefreshToken) {
    settings.gmailRefreshToken = decrypt(settings.gmailRefreshToken);
  }
  if (settings.imapPassword) {
    settings.imapPassword = decrypt(settings.imapPassword);
  }

  return settings;
}

/**
 * Update user settings
 */
export async function updateUserSettings(
  userId: string,
  data: UpdateSettingsInput
): Promise<BusinessSettings> {
  try {
    const updateData: any = { ...data };

    // Encrypt sensitive fields
    if (data.imapPassword) {
      updateData.imapPassword = encrypt(data.imapPassword);
    }

    const settings = await prisma.businessSettings.upsert({
      where: { userId },
      create: {
        userId,
        ...updateData,
      },
      update: updateData,
    });

    await createAuditLog({
      userId,
      action: "UPDATE",
      entityType: "BusinessSettings",
      entityId: settings.id,
    });

    // Return with decrypted values
    return await getUserSettings(userId);
  } catch (error: any) {
    throw handlePrismaError(error);
  }
}

/**
 * Update Gmail tokens (used during OAuth flow)
 */
export async function updateGmailTokens(
  userId: string,
  accessToken: string,
  refreshToken: string,
  expiresAt: Date
): Promise<void> {
  await prisma.businessSettings.upsert({
    where: { userId },
    create: {
      userId,
      gmailEnabled: true,
      gmailAccessToken: encrypt(accessToken),
      gmailRefreshToken: encrypt(refreshToken),
      gmailTokenExpiry: expiresAt,
    },
    update: {
      gmailEnabled: true,
      gmailAccessToken: encrypt(accessToken),
      gmailRefreshToken: encrypt(refreshToken),
      gmailTokenExpiry: expiresAt,
    },
  });
}

/**
 * Update Gmail last sync timestamp
 */
export async function updateGmailLastSync(userId: string): Promise<void> {
  await prisma.businessSettings.update({
    where: { userId },
    data: { gmailLastSync: new Date() },
  });
}

/**
 * Update IMAP last sync timestamp
 */
export async function updateImapLastSync(userId: string): Promise<void> {
  await prisma.businessSettings.update({
    where: { userId },
    data: { imapLastSync: new Date() },
  });
}
