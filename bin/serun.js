#!/usr/bin/env node

const { requireSysEnv, loadAllEnvs, executeCommand } = require("../lib");

function showHelp() {
  console.log(`Usage: serun [options] <command> [args...]

Options:
  -h, --help           Show help message
  -c, --channel <name> Load additional env from ~/.serun/<name>

Description:
  Load encrypted environment variables from ~/.serun/global and optionally
  from a channel-specific file, then execute the specified command.

Examples:
  serun npm install           Run with global env
  serun -c dev npm run        Run with global + ~/.serun/dev
  serun --channel prod node   Run with global + ~/.serun/prod
`);
  process.exit(0);
}

function parseArguments(args) {
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

function main(args) {
  const password = requireSysEnv("SERUN_SAFEKEY");

  const program = parseArguments(args);
  if (program.help) {
    showHelp();
  }

  const envs = loadAllEnvs(password, program.channel);

  if (!program.command) {
    showHelp();
  }

  executeCommand(program.command, program.commandArgs, envs);
}

main(process.argv.slice(2));
