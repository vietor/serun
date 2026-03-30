#!/usr/bin/env node

const { loadAllEnvs, executeCommand } = require("../lib");

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

function parseCommandLine(args) {
  const program = {
    help: false,
    channel: null,
    command: null,
    commandArgs: [],
  };

  if (args.length === 0) {
    program.help = true;
  }

  for (let i = 0; i < args.length; i++) {
    const name = args[i];
    if (!name.startsWith("-")) {
      break;
    }

    if (name === "--help" || name === "-h") {
      program.help = true;
      args.splice(i, 1);
    } else if (name === "--channel" || name === "-c") {
      if (i + 1 < args.length) {
        program.channel = args[i + 1];
        args.splice(i, 2);
      } else {
        showHelp();
      }
    } else {
      showHelp();
    }
  }

  if (args.length > 0) {
    program.command = args[0];
  }

  if (args.length > 1) {
    program.commandArgs = args.slice(1);
  }

  return program;
}

function main() {
  const program = parseCommandLine(process.argv.slice(2));
  if (program.help) {
    showHelp();
  }

  const envs = loadAllEnvs(program.channel);

  if (!program.command) {
    showHelp();
  }

  executeCommand(program.command, program.commandArgs, envs);
}

main();
