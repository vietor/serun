# senv

Load environment variables from `~/.senv` and run commands with them.

## Usage

```bash
senv <command> [args...]
```

## Configuration File

Create `~/.senv` with key-value pairs:

```
# This is a comment
API_KEY=secret123
DATABASE_URL=postgres://localhost/mydb
DEBUG=true
```

## Example

```bash
senv npm run dev
senv node app.js
```
