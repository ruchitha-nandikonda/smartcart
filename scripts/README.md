# Scripts

All runnable shell helpers live here. **Run from repository root** for predictable paths, for example:

```bash
./scripts/start-dynamodb.sh
./scripts/deploy-vercel.sh
```

## Recommended

| Script | Purpose |
|--------|---------|
| `start-dynamodb.sh` | Start DynamoDB Local via Docker Compose |

## Other scripts

Legacy setup helpers (`deploy-*.sh`, `setup-*.sh`, `import-*.sh`, `start-*.sh`, etc.) were moved from the repo root into this folder. Most assume they run after `cd` to the repository root (the script sets `SMARTCART_ROOT` where updated).

If a script fails with “no such file” for `frontend/` or `backend/`, run it from the repo root:

```bash
cd /path/to/smartcart
./scripts/your-script.sh
```
