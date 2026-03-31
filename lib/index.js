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

function loadEnvsFromFile(password, filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const encryptedContent = fs.readFileSync(filePath, "utf8");
  return JSON.parse(decryptText(encryptedContent, password));
}

function saveEnvsToFile(password, envs, filePath) {
  const content = JSON.stringify(envs);
  fs.writeFileSync(filePath, encryptText(content, password));
}

function getChannelFile(channel) {
  return path.join(SERUN_DIR, channel || "global");
}

function loadEnvs(password, channel) {
  const filePath = getChannelFile(channel);
  return loadEnvsFromFile(password, filePath);
}

function loadAllEnvs(password, channel) {
  const envs = loadEnvs(password, "global");

  if (channel) {
    const channelEnvs = loadEnvs(password, channel);
    Object.assign(envs, channelEnvs);
  }

  return envs;
}

function saveEnv(password, channel, key, value) {
  const filePath = getChannelFile(channel);

  const envs = loadEnvsFromFile(password, filePath);
  envs[key] = value;

  saveEnvsToFile(password, envs, filePath);
}

function saveEnvs(password, channel, otherEnvs) {
  const filePath = getChannelFile(channel);

  const envs = loadEnvsFromFile(password, filePath);
  Object.assign(envs, otherEnvs);

  saveEnvsToFile(password, envs, filePath);
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
  saveEnv,
  saveEnvs,
  executeCommand,
};
