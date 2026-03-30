#!/usr/bin/env node

const { loadAllEnvs, executeCommand } = require('../lib');

function showHelp() {
  console.log(`Usage: serun [options] <command> [args...]

Options:
  --help, -h           Show this help message
  --channel, -c <name> Load environment variables from ~/.serun/<name> after ~/.serun/default

Load environment variables from ~/.serun/default and run commands with them.
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

  const envs = loadAllEnvs(channel);

  const command = args[0];
  const commandArgs = args.slice(1);

  executeCommand(command, commandArgs, envs);
}

main();
