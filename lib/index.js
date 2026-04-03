const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { parseProgram } = require("./program");
const { encryptText, decryptText } = require("./secret");

const GLOBAL_FILE = "global";

const SERUN_DIR = path.join(
  process.env.HOME || process.env.USERPROFILE,
  ".serun",
);

function readSysEnv(key) {
  if (!process.env[key]) {
    console.error(`Error: Environment variable ${key} is not set`);
    process.exit(1);
  }

  return process.env[key];
}

function getStoreFile(channel) {
  if (!fs.existsSync(SERUN_DIR)) {
    fs.mkdirSync(SERUN_DIR, { recursive: true });
  }

  return path.join(SERUN_DIR, channel || GLOBAL_FILE);
}

function loadEnvsFromFile(safeKey, filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const encryptedContent = fs.readFileSync(filePath, "utf8");
  return JSON.parse(decryptText(encryptedContent, safeKey));
}

function saveEnvsToFile(safeKey, envs, filePath) {
  const content = JSON.stringify(envs);
  fs.writeFileSync(filePath, encryptText(content, safeKey));
}

function loadEnvs(safeKey, channel) {
  const filePath = getStoreFile(channel);
  return loadEnvsFromFile(safeKey, filePath);
}

function loadAllEnvs(safeKey, channel) {
  const envs = loadEnvs(safeKey, "global");

  if (channel) {
    const channelEnvs = loadEnvs(safeKey, channel);
    Object.assign(envs, channelEnvs);
  }

  return envs;
}

function saveEnvs(safeKey, channel, otherEnvs) {
  const filePath = getStoreFile(channel);

  const envs = loadEnvsFromFile(safeKey, filePath);
  Object.assign(envs, otherEnvs);

  saveEnvsToFile(safeKey, envs, filePath);
}

function deleteEnvs(safeKey, channel, envKeys) {
  const filePath = getStoreFile(channel);

  const envs = loadEnvsFromFile(safeKey, filePath);

  envKeys.forEach((key) => {
    delete envs[key];
  });

  saveEnvsToFile(safeKey, envs, filePath);
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

function executeCommand(command, args, envs) {
  if (process.platform === "win32") {
    args = [command, ...args];
    command = process.env.comspec || "cmd.exe";
    if (/^(?:.*\\)?cmd(?:\.exe)?$/i.test(command)) {
      args = ["/d", "/s", "/c", ...args];
    } else {
      args = ["-c", ...args];
    }
  }

  const child = spawn(command, args, {
    stdio: "inherit",
    env: { ...process.env, ...envs },
  });

  child.on("error", (err) => {
    console.error(`Failed to start command: ${err.message}`);
    process.exit(1);
  });

  child.on("exit", (code) => {
    process.exit(code || 0);
  });
}

module.exports = {
  parseProgram,
  readSysEnv,
  loadEnvs,
  loadAllEnvs,
  saveEnvs,
  deleteEnvs,
  listChannels,
  executeCommand,
};
