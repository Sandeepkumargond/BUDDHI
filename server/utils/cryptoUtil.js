import crypto from "crypto";

const ALGO = "aes-256-gcm";

function getKey() {
  const secret = process.env.CRYPTO_SECRET || process.env.ACCESS_TOKEN_SECRET || "";
  // ensure 32 bytes key (for AES-256)
  return crypto.createHash("sha256").update(String(secret)).digest();
}

export function encrypt(text) {
  if (!text) return null;
  const iv = crypto.randomBytes(12);
  const key = getKey();
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(String(text), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decrypt(payload) {
  if (!payload) return null;
  const data = Buffer.from(payload, "base64");
  const iv = data.slice(0, 12);
  const tag = data.slice(12, 28);
  const encrypted = data.slice(28);
  const key = getKey();
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}

export default { encrypt, decrypt };













































































