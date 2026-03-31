const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const { encryptText, decryptText } = require("./secret");

const SERUN_DIR = path.join(
  process.env.HOME || process.env.USERPROFILE,
  ".serun",
);

function saveEnvToFile(password, channel, key, value) {
  const filePath = path.join(SERUN_DIR, channel || "default");
  const envs = loadEnvFile(filePath, password);

  envs[key] = value;
  const content = JSON.stringify(envs);
  fs.writeFileSync(filePath, encryptText(content, password));
}

function loadEnvFile(filePath, password) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const encryptedContent = fs.readFileSync(filePath, "utf8");
  return JSON.parse(decryptText(encryptedContent, password));
}

function loadAllEnvs(password, channel) {
  const defaultFile = path.join(SERUN_DIR, "default");
  const envs = loadEnvFile(defaultFile, password);

  if (channel) {
    const channelFile = path.join(SERUN_DIR, channel);
    const channelEnvs = loadEnvFile(channelFile, password);
    Object.assign(envs, channelEnvs);
  }

  return envs;
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

function requireSystemEnv(key) {
  if (!process.env[key]) {
    console.error(`Error: Environment variable ${key} is not set`);
    process.exit(1);
  }

  return process.env[key];
}

module.exports = {
  saveEnvToFile,
  loadAllEnvs,
  executeCommand,
  requireSystemEnv,
};
