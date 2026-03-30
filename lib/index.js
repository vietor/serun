const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const SERUN_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.serun');

function loadEnvFile(filePath) {
  const envs = {};

  if (!fs.existsSync(filePath)) {
    return envs;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine === '' || trimmedLine.startsWith('#')) {
      continue;
    }

    const eqIndex = trimmedLine.indexOf('=');
    if (eqIndex === -1) {
      continue;
    }

    const key = trimmedLine.slice(0, eqIndex).trim();
    const value = trimmedLine.slice(eqIndex + 1).trim();

    if (key) {
      envs[key] = value;
    }
  }

  return envs;
}

function loadAllEnvs(channel) {
  const defaultFile = path.join(SERUN_DIR, 'default');
  const envs = loadEnvFile(defaultFile);

  if (channel) {
    const channelFile = path.join(SERUN_DIR, channel);
    const channelEnvs = loadEnvFile(channelFile);
    Object.assign(envs, channelEnvs);
  }

  return envs;
}

function executeCommand(command, args, envs) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    env: { ...process.env, ...envs }
  });

  child.on('error', (err) => {
    console.error(`Failed to start command: ${err.message}`);
    process.exit(1);
  });

  child.on('exit', (code) => {
    process.exit(code || 0);
  });
}

module.exports = { loadAllEnvs, executeCommand };
