function parseProgram(args, options) {
  const program = {
    empty: true,
    options: {},
    command: null,
    commandArgs: [],
    errorMessage: null,
  };

  if (args.length === 0) {
    return program;
  }

  program.empty = false;

  const optionMap = {};
  options.forEach((opt) => {
    const value = {
      name: opt[0] || opt[1],
      argument: opt[2],
    };

    if (opt[0]) {
      optionMap["--" + opt[0]] = value;
    }

    if (opt[1]) {
      optionMap["-" + opt[1]] = value;
    }
  });

  let i = 0;
  while (i < args.length && args[i].startsWith("-")) {
    const key = args[i];

    const opt = optionMap[key];
    if (!opt) {
      program.errorMessage = "Unsupport option: " + key;
      break;
    }

    i++;
    if (!opt.argument) {
      program.options[opt.name] = true;
    } else {
      if (i + 1 >= args.length) {
        program.errorMessage = "Option " + key + " lost argument";
        break;
      }

      program.options[opt.name] = args[i];
      i++;
    }
  }
  if (!program.errorMessage) {
    if (i < args.length) {
      program.command = args[i];
      i++;
    }

    if (i < args.length) {
      program.commandArgs = args.slice(i);
    }
  }

  return program;
}

module.exports = { parseProgram };
