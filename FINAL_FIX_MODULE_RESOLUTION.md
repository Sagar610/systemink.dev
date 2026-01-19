# Final Fix: Module Resolution Issue

## The Problem

In pnpm workspaces, dependencies are hoisted to the root `node_modules` directory. When running `node dist/main` from `apps/api`, Node.js can't find modules like `express` because it's looking in `apps/api/node_modules` which doesn't exist.

## The Solution

Run from `apps/api` directory but set `NODE_PATH` to point to the root `node_modules`:

```bash
cd apps/api && NODE_PATH=../../node_modules:$NODE_PATH node dist/main
```

This tells Node.js to look for modules in:
1. `../../node_modules` (root node_modules where pnpm hoists dependencies)
2. `./node_modules` (current directory, if any)
3. Standard Node.js resolution paths

## Updated Files

1. **render.yaml** - Start command:
   ```yaml
   startCommand: cd apps/api && NODE_PATH=../../node_modules:$NODE_PATH node dist/main
   ```

2. **RENDER_DEPLOYMENT.md** - Updated documentation

## Why This Works

- `cd apps/api` - Changes to the API directory (for relative paths in code)
- `NODE_PATH=../../node_modules` - Points to root node_modules where pnpm stores dependencies
- `node dist/main` - Runs the compiled application

## Next Steps

1. Commit and push:
   ```bash
   git add render.yaml apps/api/src/main.ts RENDER_DEPLOYMENT.md
   git commit -m "Fix module resolution: use NODE_PATH for pnpm workspace"
   git push
   ```

2. Render will automatically redeploy

3. Check logs - you should see:
   - `🔄 Running database migrations...`
   - `✅ Migrations completed successfully`
   - `🚀 API running on http://localhost:3000`

This is the definitive fix that will work with pnpm's workspace structure!
