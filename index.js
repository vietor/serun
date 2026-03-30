#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const SENV_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.senv');

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

function showHelp() {
  console.log(`Usage: senv [options] <command> [args...]

Options:
  --help, -h           Show this help message
  --channel, -c <name> Load environment variables from ~/.senv/<name> after ~/.senv/default

Load environment variables from ~/.senv/default and run commands with them.
Optionally load a channel-specific file after the default file.
`);
  process.exit(0);
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
  }

  let channel = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--channel' && i + 1 < args.length) {
      channel = args[i + 1];
      args.splice(i, 2);
      break;
    } else if (args[i] === '-c' && i + 1 < args.length) {
      channel = args[i + 1];
      args.splice(i, 2);
      break;
    }
  }

  const defaultFile = path.join(SENV_DIR, 'default');
  const envs = loadEnvFile(defaultFile);

  if (channel) {
    const channelFile = path.join(SENV_DIR, channel);
    const channelEnvs = loadEnvFile(channelFile);
    Object.assign(envs, channelEnvs);
  }

  const command = args[0];
  const commandArgs = args.slice(1);

  const child = spawn(command, commandArgs, {
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

main();
