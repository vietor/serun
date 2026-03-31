const crypto = require("crypto");

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
  const inputData = Buffer.from(data, "utf8");
  const cipher = crypto.createCipheriv("aes-256-ecb", key, null);

  let encrypted = cipher.update(inputData);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return encrypted.toString("base64");
}

function decryptText(encryptedData, password) {
  if (typeof encryptedData !== "string") {
    throw new Error("Encrypted data must be a string");
  }
  if (typeof password !== "string") {
    throw new Error("Password must be a string");
  }

  const key = generateKeyFromPassword(password);

  let inputData;
  try {
    inputData = Buffer.from(encryptedData, "base64");
  } catch (error) {
    throw new Error("Invalid Base64 format");
  }

  const decipher = crypto.createDecipheriv("aes-256-ecb", key, null);

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
