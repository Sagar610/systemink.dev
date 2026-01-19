# Alternative Solution: If Start Script Doesn't Work

If the start script approach still doesn't work, here are alternative solutions:

## Option 1: Use npm instead of pnpm (Simplest but not ideal)

Change the build command to use npm:

```yaml
buildCommand: npm install && npm run build --workspace=apps/api
startCommand: cd apps/api && node dist/main
```

This would require:
1. Adding a build script to root package.json
2. Using npm workspaces instead of pnpm

## Option 2: Copy node_modules to apps/api during build

Add to build command:
```bash
cp -r node_modules apps/api/ 2>/dev/null || true
```

Then start command can be:
```bash
cd apps/api && node dist/main
```

## Option 3: Use pnpm deploy (isolates dependencies)

Add to build command:
```bash
cd apps/api && pnpm deploy --filter @systemink/api --prod
```

This creates a standalone deployment with all dependencies.

## Option 4: Use Docker (Most reliable)

Create a Dockerfile that properly sets up the environment.

## Current Solution: Start Script

We're trying a start script that uses `pnpm exec` which should handle module resolution properly.
