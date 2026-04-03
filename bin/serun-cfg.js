#!/usr/bin/env node

const fs = require("fs");
const {
  parseProgram,
  readSysEnv,
  loadEnvs,
  saveEnvs,
  deleteEnvs,
} = require("../lib");

function showHelp() {
  console.log(`Usage: serun-cfg [options] <action> [args...]

Options:
  -h, --help           Show help message
  -c, --channel <name> Target config file ~/.serun/<name> (default: global)

Actions:
  import <file>        Import environment variables from .env format file
  set <key> <value>    Set an environment variable
  del <key1> [key2...] Delete environment variables
  delete               Alias for del
  show                 Show saved environment variables

Description:
  Configure encrypted environment variables for use with serun.
  Variables are stored in ~/.serun/global or a channel-specific file.

Examples:
  serun-cfg set API_KEY abc123      Set global variable
  serun-cfg -c dev set DB_URL pg:// Set variable in ~/.serun/dev
  serun-cfg del API_KEY             Delete variable
`);
  process.exit(0);
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
  const program = parseProgram(args, [
    ["help", "h", false],
    ["channel", "c", true],
  ]);

  if (
    program.empty ||
    program.options.help ||
    program.errorMessage ||
    !program.command
  ) {
    showHelp();
  }

  const safeKey = readSysEnv("SERUN_SAFEKEY");
  if (program.command === "import") {
    if (program.commandArgs.length != 1) {
      showHelp();
    }
    saveEnvs(
      safeKey,
      program.options.channel,
      readEnvs(program.commandArgs[0]),
    );
  } else if (program.command === "set") {
    if (program.commandArgs.length != 2) {
      showHelp();
    }

    saveEnvs(safeKey, program.options.channel, {
      [program.commandArgs[0]]: program.commandArgs[1],
    });
  } else if (program.command === "del" || program.command === "delete") {
    if (program.commandArgs.length < 1) {
      showHelp();
    }

    deleteEnvs(safeKey, program.options.channel, program.commandArgs);
  } else if (program.command === "show") {
    showEnvs(loadEnvs(safeKey, program.options.channel));
  } else {
    showHelp();
  }
}

main(process.argv.slice(2));
