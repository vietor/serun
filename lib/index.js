const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { encryptText, decryptText } = require("./secret");

const SERUN_DIR = path.join(
  process.env.HOME || process.env.USERPROFILE,
  ".serun",
);

function requireSysEnv(key) {
  if (!process.env[key]) {
    console.error(`Error: Environment variable ${key} is not set`);
    process.exit(1);
  }

  return process.env[key];
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

function getChannelFile(channel) {
  return path.join(SERUN_DIR, channel || "global");
}

function loadEnvs(safeKey, channel) {
  const filePath = getChannelFile(channel);
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
  const filePath = getChannelFile(channel);

  const envs = loadEnvsFromFile(safeKey, filePath);
  Object.assign(envs, otherEnvs);

  saveEnvsToFile(safeKey, envs, filePath);
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
  requireSysEnv,
  loadEnvs,
  loadAllEnvs,
  saveEnvs,
  executeCommand,
};
