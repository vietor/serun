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
    return program;
  }

  let i = 0;
  while (i < args.length && args[i].startsWith("-")) {
    const name = args[i];

    if (name === "--help" || name === "-h") {
      program.help = true;
      i++;
    } else if (name === "--channel" || name === "-c") {
      if (i + 1 < args.length) {
        program.channel = args[i + 1];
        i += 2;
      } else {
        showHelp();
      }
    } else {
      showHelp();
    }
  }

  if (i < args.length) {
    program.command = args[i];
    i++;
  }

  if (i < args.length) {
    program.commandArgs = args.slice(i);
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
