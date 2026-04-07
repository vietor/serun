#!/usr/bin/env node

const fs = require("fs");
const {
  parseProgram,
  readSysEnv,
  EnvHub,
  readEnvs,
  updateEnvs,
  deleteEnvs,
  listChannels,
} = require("../lib");

const pkg = require("../package.json");

function showHelp() {
  console.log(`Usage: serun-cfg [options] <action> [args...]

Options:
  -h, --help           Show help message
  -V, --version        Show version number
  -c, --channel <name> Target config file ~/.serun/<name> (default: global)

Actions:
  import <file>        Import environment variables from a file (e.g., .env)
  set <key> <value>    Set an environment variable
  del <key1> [key2...] Delete one or more environment variables
  delete               Alias for del
  show                 Show all saved environment variables from the config
  list                 List all channel names (ignores -c option)

Description:
  Configure encrypted environment variables for serun.
  Variables are stored in ~/.serun/global or channel-specific files.

Examples:
  serun-cfg set API_KEY abc123        Set global variable
  serun-cfg -c dev set DB_URL pg://   Set variable in dev channel
  serun-cfg -c prod show              Show variables in prod channel
  serun-cfg del API_KEY DB_URL        Delete multiple variables
  serun-cfg import ./project.env      Import from .env file
`);
  process.exit(0);
}

function showEnvs(envHub) {
  envHub.forEach((key, value) => {
    console.log(key + "=" + value);
  });
}

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const envHub = new EnvHub();

  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split("\n")) {
    envHub.parseLine(line);
  }

  return envHub;
}

function main(args) {
  const program = parseProgram(args, [
    ["help", "h", false],
    ["channel", "c", true],
    ["version", "V", false],
  ]);

  if (program.options.version) {
    console.log(pkg.version);
    process.exit(0);
  }

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
    updateEnvs(
      safeKey,
      program.options.channel,
      parseEnvFile(program.commandArgs[0]),
    );
  } else if (program.command === "set") {
    if (program.commandArgs.length != 2) {
      showHelp();
    }

    const envHub = new EnvHub();
    envHub.set(program.commandArgs[0], program.commandArgs[1]);

    updateEnvs(safeKey, program.options.channel, envHub);
  } else if (program.command === "del" || program.command === "delete") {
    if (program.commandArgs.length < 1) {
      showHelp();
    }

    deleteEnvs(safeKey, program.options.channel, program.commandArgs);
  } else if (program.command === "show") {
    showEnvs(readEnvs(safeKey, program.options.channel));
  } else if (program.command === "list") {
    const channels = listChannels();
    if (channels.length > 0) {
      console.log(channels.join(" "));
    }
  } else {
    showHelp();
  }
}

main(process.argv.slice(2));
