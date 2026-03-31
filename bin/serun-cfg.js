#!/usr/bin/env node

const fs = require("fs");
const { requireSysEnv, loadEnvs, saveEnvs } = require("../lib");

function showHelp() {
  console.log(`Usage: serun-cfg [options] <action> [args...]

Options:
  -h, --help           Show help message
  -c, --channel <name> Target config file ~/.serun/<name> (default: global)

Actions:
  import <file>        Import environment variables from .env format file
  set <key> <value>    Set an environment variable
  show                 Show saved environment variables

Description:
  Configure encrypted environment variables for use with serun.
  Variables are stored in ~/.serun/global or a channel-specific file.

Examples:
  serun-cfg set API_KEY abc123        Set global variable
  serun-cfg -c dev set DB_URL pg://   Set variable in ~/.serun/dev
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
    program.action = args[i];
    i++;
  }

  if (i < args.length) {
    program.actionArgs = args.slice(i);
  }

  return program;
}

function showEnvs(envs) {
  Object.keys(envs).forEach((key) => {
    console.log(key + "=" + envs[key]);
  });
}

function readEnvs(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const envs = {};

  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split("\n")) {
    const trimmedLine = line.trim();

    if (trimmedLine === "" || trimmedLine.startsWith("#")) {
      continue;
    }

    const eqIndex = trimmedLine.indexOf("=");
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

function main(args) {
  const password = requireSysEnv("SERUN_SAFEKEY");

  const program = parseArguments(args);
  if (program.help) {
    showHelp();
  }

  if (program.action == "import") {
    if (program.actionArgs.length != 1) {
      showHelp();
    }
    saveEnvs(password, program.channel, readEnvs(program.actionArgs[0]));
  } else if (program.action == "set") {
    if (program.actionArgs.length != 2) {
      showHelp();
    }

    saveEnvs(password, program.channel, {
      [program.actionArgs[0]]: program.actionArgs[1],
    });
  } else if (program.action == "show") {
    showEnvs(loadEnvs(password, program.channel));
  } else {
    showHelp();
  }
}

main(process.argv.slice(2));
