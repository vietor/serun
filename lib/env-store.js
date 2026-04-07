const fs = require("fs");
const path = require("path");
const { encryptText, decryptText } = require("./secret");
const { EnvHub } = require("./env-hub");

const GLOBAL_FILE = "global";

const SERUN_DIR = path.join(
  process.env.HOME || process.env.USERPROFILE,
  ".serun",
);

function getStoreFile(channel) {
  if (!fs.existsSync(SERUN_DIR)) {
    fs.mkdirSync(SERUN_DIR, { recursive: true });
  }

  return path.join(SERUN_DIR, channel || GLOBAL_FILE);
}

function readDataFromFile(safeKey, filePath) {
  if (!fs.existsSync(filePath)) {
    return new EnvHub();
  }

  const encryptedContent = fs.readFileSync(filePath, "utf8");
  const content = decryptText(encryptedContent, safeKey);

  let lines;
  try {
    lines = JSON.parse(content);
  } catch (error) {
    throw new Error("File format invalid: data corrupted or not JSON");
  }

  const envHub = new EnvHub();
  envHub.parseLines(lines);
  return envHub;
}

function writeDataToFile(safeKey, envHub, filePath) {
  const content = JSON.stringify(envHub.toLines());
  fs.writeFileSync(filePath, encryptText(content, safeKey));
}

function readEnvs(safeKey, channel) {
  const filePath = getStoreFile(channel);
  return readDataFromFile(safeKey, filePath);
}

function updateEnvs(safeKey, channel, updateHub) {
  const filePath = getStoreFile(channel);

  const envHub = readDataFromFile(safeKey, filePath);
  envHub.parseLines(updateHub.toLines());
  writeDataToFile(safeKey, envHub, filePath);
}

function deleteEnvs(safeKey, channel, envKeys) {
  const filePath = getStoreFile(channel);

  const envHub = readDataFromFile(safeKey, filePath);
  envKeys.forEach((key) => {
    envHub.del(key);
  });
  writeDataToFile(safeKey, envHub, filePath);
}

function listChannels() {
  if (!fs.existsSync(SERUN_DIR)) {
    return [];
  }

  const files = fs.readdirSync(SERUN_DIR);
  if (files.length > 0) {
    const index = files.indexOf(GLOBAL_FILE);
    if (index > -1) {
      files.splice(index, 1);
    }
  }

  return files;
}

module.exports = {
  readEnvs,
  updateEnvs,
  deleteEnvs,
  listChannels,
};
