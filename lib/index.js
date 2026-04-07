const { spawn } = require("child_process");
const { parseProgram } = require("./program");
const { EnvHub } = require("./env-hub");
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

function injectEnvs(envHub, updateHub) {
  updateHub.forEach((key, value) => {
    if (typeof value !== "string") {
      envHub.set(key, value);
    } else {
      const modifiedValue = value.replace(/\$\{([^}]+)\}/g, (_, varName) => {
        if (envHub.has(varName)) {
          return envHub.get(varName);
        }
        if (process.env.hasOwnProperty(varName)) {
          return process.env[varName];
        }
        return "";
      });

      envHub.set(key, modifiedValue);
    }
  });
}

function loadAllEnvs(safeKey, channel) {
  const envHub = new EnvHub();

  injectEnvs(envHub, readEnvs(safeKey, "global"));
  if (channel) {
    injectEnvs(envHub, readEnvs(safeKey, channel));
  }

  return envHub;
}

function executeCommand(command, args, envHub) {
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
    env: { ...process.env, ...envHub.envs() },
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
  EnvHub,
  readEnvs,
  updateEnvs,
  deleteEnvs,
  listChannels,
  loadAllEnvs,
  executeCommand,
};
