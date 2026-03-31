#!/usr/bin/env node

const {
  requireSystemEnv,
  saveEnvToFile,
} = require("../lib");

function showHelp() {
  console.log(`Usage: serun-config [options] <action> [args...]

Options:
  -h, --help           Show this help message
  -c, --channel <name> Target config file ~/.serun/<name> (default: global)

Actions:
  set <key> <value>    Set an environment variable

Description:
  Configure encrypted environment variables for use with serun.
  Variables are stored in ~/.serun/global or a channel-specific file.

Examples:
  serun-config set API_KEY abc123       Set global variable
  serun-config -c dev set DB_URL pg://  Set variable in ~/.serun/dev
`);
  process.exit(0);
}

function parseArguments(args) {
  const program = {
    help: false,
    channel: null,
    action: null,
    actionArgs: [],
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
    program.action = args[0];
  }

  if (args.length > 1) {
    program.actionArgs = args.slice(1);
  }

  return program;
}

function main(args) {
  const password = requireSystemEnv("SERUN_SAFEKEY");

  const program = parseArguments(args);
  if (program.help) {
    showHelp();
  }

  if (program.action == "set") {
    if (program.actionArgs.length != 2) {
      showHelp();
    }

    saveEnvToFile(
      password,
      program.channel,
      program.actionArgs[0],
      program.actionArgs[1],
    );
  } else {
    showHelp();
  }
}

main(process.argv.slice(2));
