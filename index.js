#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const SENV_FILE = path.join(process.env.HOME || process.env.USERPROFILE, '.senv');

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
  --help, -h     Show this help message

Load environment variables from ~/.senv and run commands with them.
`);
  process.exit(0);
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
  }

  const envs = loadEnvFile(SENV_FILE);
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
