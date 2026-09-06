// Cache the imported CryptoKey to avoid importing it repeatedly
let cachedKey: CryptoKey | null = null;

/**
 * Imports the raw hex key into a CryptoKey object for AES-GCM operations.
 */
async function getCryptoKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;

  const keyHex = import.meta.env.VITE_ENCRYPTION_KEY || "";
  if (!keyHex || keyHex.length !== 64) {
    throw new Error("Invalid or missing VITE_ENCRYPTION_KEY (must be 64 hex characters)");
  }

  // Convert the 64-character hex string back into a 32-byte Uint8Array
  const rawKey = new Uint8Array(
    keyHex.match(/.{1,2}/g)!.map((byte: any) => parseInt(byte, 16))
  );

  // Import key into SubtleCrypto interface
  cachedKey = await window.crypto.subtle.importKey(
    "raw",
    rawKey,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  return cachedKey;
}

/**
 * Encrypts any JS payload object into a GCM ciphertext string formatted as 'iv.ciphertext_and_tag'.
 */
export async function encryptData(data: any): Promise<string> {
  // Serialize payload to JSON string
  const jsonString = JSON.stringify(data);
  // Encode JSON string into binary buffer
  const encodedData = new TextEncoder().encode(jsonString);
  // Generate a random 12-byte initialization vector (IV) for AES-GCM
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  // Import or retrieve key
  const key = await getCryptoKey();

  // Encrypt using SubtleCrypto; the resulting ArrayBuffer automatically appends the 16-byte authentication tag
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encodedData
  );

  // Convert IV to hex format for transit
  const ivHex = Array.from(iv)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Convert encrypted ciphertext & tag array buffer to Base64 format
  const ciphertextBase64 = btoa(
    String.fromCharCode(...new Uint8Array(encryptedBuffer))
  );

  // Return IV and base64 string joined by dot
  return `${ivHex}.${ciphertextBase64}`;
}
