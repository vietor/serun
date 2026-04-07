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

function injectEnvs(envs, updates) {
  for (const [key, value] of Object.entries(updates)) {
    if (typeof value === "string") {
      envs[key] = value.replace(/\$\{([^}]+)\}/g, (_, varName) => {
        if (envs.hasOwnProperty(varName)) {
          return envs[varName];
        }
        if (process.env.hasOwnProperty(varName)) {
          return process.env[varName];
        }
        return "";
      });
    } else {
      envs[key] = value;
    }
  }
}

function loadAllEnvs(safeKey, channel) {
  const envs = {};

  injectEnvs(envs, readEnvs(safeKey, "global"));
  if (channel) {
    injectEnvs(envs, readEnvs(safeKey, channel));
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
