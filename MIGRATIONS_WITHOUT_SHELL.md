# Running Migrations Without Shell Access (Render Free Tier)

Since Render's Shell feature is only available on paid plans, we've set up **automatic migrations** that run during build and on startup.

## ✅ Automatic Migration Setup

Migrations now run in **two places**:

1. **During Build** - After the build completes, migrations run automatically
2. **On Startup** - When the server starts, migrations run as a backup

This ensures your database is always up to date, even without Shell access!

## 🔧 How It Works

### Build Command (render.yaml)
```bash
npm install -g pnpm@8.15.0 && pnpm install && pnpm --filter @systemink/shared build && cd apps/api && npx prisma generate && cd ../.. && pnpm --filter @systemink/api build && cd apps/api && npx prisma migrate deploy && cd ../..
```

The `npx prisma migrate deploy` at the end runs migrations after the build.

### Startup (main.ts)
The server also runs migrations on startup in production mode as a safety net.

## 📝 Creating New Migrations

Since you can't use Shell, here's how to create and apply new migrations:

### Step 1: Create Migration Locally

1. On your local machine, set up your `.env` file in `apps/api/`:
   ```env
   DATABASE_URL="postgresql://systemink_zjut_user:EXHNvqC5tfZX217AcAQvAADKZfswbkge@dpg-d5n0rot6ubrc73ahk7r0-a.frankfurt-postgres.render.com/systemink_zjut"
   ```
   *Use the External URL for local development*

2. Make changes to `apps/api/prisma/schema.prisma`

3. Create migration:
   ```bash
   cd apps/api
   pnpm prisma migrate dev --name your_migration_name
   ```

4. This creates a new migration file in `apps/api/prisma/migrations/`

### Step 2: Commit and Push

```bash
git add apps/api/prisma/migrations/
git commit -m "Add migration: your_migration_name"
git push
```

### Step 3: Deploy

When Render deploys your code:
- The build command will run `prisma migrate deploy`
- This applies your new migration automatically
- Check the build logs to verify it succeeded

## 🚀 Initial Database Setup

For the **first time** setting up your database:

### Option 1: Use Prisma db push (Simplest)

1. On your local machine, connect to Render database:
   ```env
   DATABASE_URL="postgresql://systemink_zjut_user:EXHNvqC5tfZX217AcAQvAADKZfswbkge@dpg-d5n0rot6ubrc73ahk7r0-a.frankfurt-postgres.render.com/systemink_zjut"
   ```

2. Push schema directly:
   ```bash
   cd apps/api
   npx prisma db push
   ```

3. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

**Note**: `db push` doesn't create migration files, but it syncs your schema to the database.

### Option 2: Create Initial Migration

1. On your local machine, set `DATABASE_URL` to Render External URL

2. Create initial migration:
   ```bash
   cd apps/api
   pnpm prisma migrate dev --name init
   ```

3. Commit the migration files:
   ```bash
   git add apps/api/prisma/migrations/
   git commit -m "Initial database migration"
   git push
   ```

4. On next Render deploy, the migration will run automatically

## 🌱 Seeding the Database

Since you can't use Shell, here are options to seed your database:

### Option 1: Create a Temporary Seed Endpoint

Add this to your API temporarily (remove after seeding):

```typescript
// In apps/api/src/app.module.ts or a new controller
@Get('seed')
async seed() {
  // Your seed logic here
  return { message: 'Database seeded' };
}
```

Then visit: `https://your-api-url.onrender.com/api/seed` once, then remove the endpoint.

### Option 2: Use Prisma Studio Locally

1. Connect Prisma Studio to Render database:
   ```bash
   cd apps/api
   DATABASE_URL="postgresql://systemink_zjut_user:EXHNvqC5tfZX217AcAQvAADKZfswbkge@dpg-d5n0rot6ubrc73ahk7r0-a.frankfurt-postgres.render.com/systemink_zjut" npx prisma studio
   ```

2. Manually add data through the UI

### Option 3: SQL Script

Create a SQL script and run it using a local PostgreSQL client connected to Render:

```sql
-- seed.sql
INSERT INTO "User" (id, name, username, email, "passwordHash", role) 
VALUES ('...', 'Admin', 'admin', 'admin@systemink.dev', '...', 'ADMIN');
```

Then:
```bash
psql "postgresql://systemink_zjut_user:EXHNvqC5tfZX217AcAQvAADKZfswbkge@dpg-d5n0rot6ubrc73ahk7r0-a.frankfurt-postgres.render.com/systemink_zjut" -f seed.sql
```

## ✅ Verification

After deployment, check your API logs in Render Dashboard:

**Success indicators:**
- `🔄 Running database migrations...`
- `✅ Migrations completed successfully`
- `🚀 API running on http://localhost:3000`

**If migrations fail:**
- Check `DATABASE_URL` is set correctly (Internal URL)
- Verify database is accessible
- Check build logs for migration errors

## 🔒 Security Note

Never commit your `.env` file with database credentials. Always use Render's environment variables for production.

## 📚 Summary

- ✅ Migrations run automatically during build
- ✅ Migrations also run on startup as backup
- ✅ No Shell access needed!
- ✅ Create migrations locally, commit, and push
- ✅ Migrations apply automatically on deploy

Your database will always stay in sync with your schema! 🎉
