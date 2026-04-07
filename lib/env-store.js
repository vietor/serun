const fs = require("fs");
const path = require("path");
const { encryptText, decryptText } = require("./secret");

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

function readEnvsFromFile(safeKey, filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const encryptedContent = fs.readFileSync(filePath, "utf8");
  return JSON.parse(decryptText(encryptedContent, safeKey));
}

function writeEnvsToFile(safeKey, envs, filePath) {
  const content = JSON.stringify(envs);
  fs.writeFileSync(filePath, encryptText(content, safeKey));
}

function readEnvs(safeKey, channel) {
  const filePath = getStoreFile(channel);
  return readEnvsFromFile(safeKey, filePath);
}

function updateEnvs(safeKey, channel, updates) {
  const filePath = getStoreFile(channel);

  const envs = readEnvsFromFile(safeKey, filePath);
  Object.assign(envs, updates);

  writeEnvsToFile(safeKey, envs, filePath);
}

function deleteEnvs(safeKey, channel, envKeys) {
  const filePath = getStoreFile(channel);

  const envs = readEnvsFromFile(safeKey, filePath);

  envKeys.forEach((key) => {
    delete envs[key];
  });

  writeEnvsToFile(safeKey, envs, filePath);
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
