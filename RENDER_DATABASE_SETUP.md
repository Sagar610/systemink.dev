# Render Database Configuration for SystemInk

## Your Database Information

**Database Name**: `systemink_zjut`  
**Username**: `systemink_zjut_user`  
**Host (Internal)**: `dpg-d5n0rot6ubrc73ahk7r0-a`  
**Host (External)**: `dpg-d5n0rot6ubrc73ahk7r0-a.frankfurt-postgres.render.com`  
**Port**: `5432`  
**Password**: `EXHNvqC5tfZX217AcAQvAADKZfswbkge`

## Connection Strings

### Internal Database URL (Use This for API Service)
```
postgresql://systemink_zjut_user:EXHNvqC5tfZX217AcAQvAADKZfswbkge@dpg-d5n0rot6ubrc73ahk7r0-a/systemink_zjut
```

### External Database URL (For Local Development/psql)
```
postgresql://systemink_zjut_user:EXHNvqC5tfZX217AcAQvAADKZfswbkge@dpg-d5n0rot6ubrc73ahk7r0-a.frankfurt-postgres.render.com/systemink_zjut
```

## Setting Up Environment Variables in Render

### For API Service

1. Go to your **API service** in Render Dashboard
2. Click on **"Environment"** tab
3. Find or add the `DATABASE_URL` variable
4. Set it to the **Internal Database URL**:
   ```
   postgresql://systemink_zjut_user:EXHNvqC5tfZX217AcAQvAADKZfswbkge@dpg-d5n0rot6ubrc73ahk7r0-a/systemink_zjut
   ```
5. Click **"Save Changes"**

## Important Notes

⚠️ **CRITICAL**: Always use the **INTERNAL** database URL for the `DATABASE_URL` environment variable in your API service. The internal URL allows your API service to connect to the database without going through the public internet, which is:
- Faster
- More secure
- Required for Render services on the same network

❌ **DO NOT** use the external URL in your API service - it will cause connection issues and is slower.

## Running Migrations

After your API service is deployed, run migrations using the Shell:

1. Go to your **API service** → **"Shell"** tab
2. Run these commands:
   ```bash
   cd apps/api
   pnpm prisma generate
   pnpm prisma migrate deploy
   ```

## Connecting from Local Machine (Optional)

If you need to connect from your local machine for debugging:

### Using psql:
```bash
PGPASSWORD=EXHNvqC5tfZX217AcAQvAADKZfswbkge psql -h dpg-d5n0rot6ubrc73ahk7r0-a.frankfurt-postgres.render.com -U systemink_zjut_user systemink_zjut
```

### Using Connection String:
Use the **External Database URL** in your local `.env` file:
```env
DATABASE_URL="postgresql://systemink_zjut_user:EXHNvqC5tfZX217AcAQvAADKZfswbkge@dpg-d5n0rot6ubrc73ahk7r0-a.frankfurt-postgres.render.com/systemink_zjut"
```

## Verification

To verify your database connection:

1. Check API service logs after deployment
2. Look for: `🚀 API running on http://localhost:3000` (success)
3. Or errors like: `Can't reach database server` (connection issue)

If you see connection errors:
- Verify `DATABASE_URL` is set to the **Internal URL**
- Check that database status is "Available" (green) in Render dashboard
- Wait a few minutes after creating the database before deploying API

## Security Reminder

🔒 **Never commit these credentials to Git!** They are already set in your Render environment variables, which is the secure way to handle them.
