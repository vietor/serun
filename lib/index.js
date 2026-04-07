const { spawn } = require("child_process");
const { parseProgram } = require("./program");
const {
  readEnvs,
  updateEnvs,
  deleteEnvs,
  listChannels,
} = require("./env-store");

function readSysEnv(key) {
  if (!process.env[key]) {
    console.error(`Error: Environment variable ${key} is not set`);
    process.exit(1);
  }

  return process.env[key];
}

function loadAllEnvs(safeKey, channel) {
  const envs = readEnvs(safeKey, "global");

  if (channel) {
    const channelEnvs = readEnvs(safeKey, channel);
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

module.exports = {
  parseProgram,
  readSysEnv,
  readEnvs,
  updateEnvs,
  deleteEnvs,
  listChannels,
  loadAllEnvs,
  executeCommand,
};
