# serun

Load environment variables from `~/.serun` and run commands with them.

## Usage

```bash
serun <command> [args...]
```

## Configuration File

Create `~/.serun` with key-value pairs:

```
# This is a comment
API_KEY=secret123
DATABASE_URL=postgres://localhost/mydb
DEBUG=true
```

## Example

```bash
serun npm run dev
serun node app.js
```
