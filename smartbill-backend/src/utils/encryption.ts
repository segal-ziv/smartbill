import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const ALGORITHM = "aes-256-cbc";
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "";

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
  console.warn("Warning: ENCRYPTION_KEY not set or too short. Using default (INSECURE!)");
}

const KEY = scryptSync(ENCRYPTION_KEY || "default-insecure-key", "salt", 32);

/**
 * Encrypt sensitive data (tokens, passwords, etc.)
 */
export function encrypt(text: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, KEY, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return `${iv.toString("hex")}:${encrypted}`;
}

/**
 * Decrypt sensitive data
 */
export function decrypt(encryptedText: string): string {
  const [ivHex, encrypted] = encryptedText.split(":");

  if (!ivHex || !encrypted) {
    throw new Error("Invalid encrypted text format");
  }

  const iv = Buffer.from(ivHex, "hex");
  const decipher = createDecipheriv(ALGORITHM, KEY, iv);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Securely hash a value (one-way, for comparing)
 */
export function hash(text: string): string {
  return scryptSync(text, "salt", 64).toString("hex");
}
