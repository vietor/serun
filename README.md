# serun

Secure environment variable runner with encrypted storage.

## Installation

```bash
npm install -g @vietor/serun
```

## Quick Start

1. Set the master key environment variable:
```bash
export SERUN_SAFEKEY="your-master-password"
```

2. Configure environment variables:
```bash
serun-cfg set API_KEY abc123
```

3. Run commands with encrypted environment variables:
```bash
serun npm run dev
```

## Commands

### serun

Execute commands with encrypted environment variables loaded from `~/.serun/global` and optionally a channel-specific file.

```
Usage: serun [options] <command> [args...]

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
```

### serun-cfg

Configure encrypted environment variables for use with serun.

```
Usage: serun-cfg [options] <action> [args...]

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
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SERUN_SAFEKEY` | Master password for encrypting/decrypting environment variables |

## Storage

Environment variables are stored encrypted in:
- `~/.serun/global` - Default global configuration
- `~/.serun/<channel>` - Channel-specific configurations

## Security

- All environment variables are encrypted using AES-256-CBC
- The master key (`SERUN_SAFEKEY`) is never stored on disk
- Each channel provides isolated environment variable sets
