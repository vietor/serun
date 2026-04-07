#!/usr/bin/env node

const {
  parseProgram,
  readSysEnv,
  loadAllEnvs,
  executeCommand,
} = require("../lib");

const pkg = require("../package.json");

function showHelp() {
  console.log(`Usage: serun [options] <command> [args...]

Options:
  -h, --help           Show help message
  -V, --version        Show version number
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
  const envHub = loadAllEnvs(safeKey, program.options.channel);
  executeCommand(program.command, program.commandArgs, envHub);
}

main(process.argv.slice(2));
