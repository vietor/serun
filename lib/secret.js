const crypto = require("crypto");

const IV_LENGTH = 16;
const ALGORITHM = "aes-256-cbc";
const ENCODING = "base64";

function generateKeyFromPassword(password) {
  return crypto.createHash("sha256").update(password).digest();
}

function encryptText(data, password) {
  if (typeof data !== "string") {
    throw new Error("Input data must be a string");
  }
  if (typeof password !== "string") {
    throw new Error("Password must be a string");
  }

  const key = generateKeyFromPassword(password);
  const iv = crypto.randomBytes(IV_LENGTH);
  const inputData = Buffer.from(data, "utf8");

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(inputData);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString(ENCODING) + ":" + encrypted.toString(ENCODING);
}

function decryptText(encryptedData, password) {
  if (typeof encryptedData !== "string") {
    throw new Error("Encrypted data must be a string");
  }
  if (typeof password !== "string") {
    throw new Error("Password must be a string");
  }

  const key = generateKeyFromPassword(password);

  const parts = encryptedData.split(":");
  if (parts.length !== 2) {
    throw new Error("Invalid encrypted data format");
  }

  const iv = Buffer.from(parts[0], ENCODING);
  const inputData = Buffer.from(parts[1], ENCODING);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

  let decrypted;
  try {
    decrypted = decipher.update(inputData);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
  } catch (error) {
    throw new Error("Decryption failed, invalid password or corrupted data");
  }

  return decrypted.toString("utf8");
}

module.exports = { encryptText, decryptText };
