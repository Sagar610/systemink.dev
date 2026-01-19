# Complete Render.com Deployment Guide for SystemInk

This guide will walk you through deploying your SystemInk application to Render.com step by step. **Read every step carefully** to avoid errors.

## 📋 Prerequisites

1. **GitHub Account** - Your code must be on GitHub
2. **Render Account** - Sign up at [render.com](https://render.com) (free tier available)
3. **Code Pushed to GitHub** - Make sure your code is pushed to GitHub

## 🏗️ Architecture Overview

Your application will be deployed as **3 separate services** on Render:

1. **PostgreSQL Database** - Stores all your data
2. **Backend API Service** - NestJS API (Node.js)
3. **Frontend Web Service** - React static site

## 📝 Step-by-Step Deployment Instructions

### Step 1: Push Your Code to GitHub

If you haven't already, push your code to GitHub:

```bash
# Run the deployment script
.\deploy-to-github.ps1

# Or manually:
git add .
git commit -m "Ready for Render deployment"
git push -u origin main
```

### Step 2: Create PostgreSQL Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `systemink-database`
   - **Database**: `systemink`
   - **User**: `systemink_user`
   - **Region**: Choose closest to you (e.g., `Oregon`)
   - **Plan**: `Starter` (Free tier)
4. Click **"Create Database"**
5. **IMPORTANT**: Wait for the database to be fully created (green status)
6. Copy the **Internal Database URL** (you'll need this later)

### Step 3: Deploy Backend API Service

1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository:
   - Click **"Connect account"** if not connected
   - Select your repository: `systemink.dev`
   - Click **"Connect"**
3. Configure the service:
   - **Name**: `systemink-api`
   - **Region**: Same as database (e.g., `Oregon`)
   - **Branch**: `main`
   - **Root Directory**: Leave empty (root of repo)
   - **Environment**: `Node`
   - **Build Command**: 
     ```bash
     npm install -g pnpm@8.15.0 && pnpm install && pnpm --filter @systemink/shared build && pnpm --filter @systemink/api build
     ```
   - **Start Command**: 
     ```bash
     cd apps/api && pnpm start:prod
     ```
   - **Plan**: `Starter` (Free tier)

4. **Environment Variables** - Click "Advanced" → "Add Environment Variable":
   
   Add these **ONE BY ONE** (click "Add Another" after each):
   
   ```
   NODE_ENV = production
   ```
   
   ```
   PORT = 3000
   ```
   
   ```
   DATABASE_URL = [Paste the Internal Database URL from Step 2]
   ```
   
   ```
   JWT_SECRET = [Generate a long random string - at least 32 characters]
   ```
   *Tip: Use an online generator or run: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   
   ```
   JWT_EXPIRES_IN = 15m
   ```
   
   ```
   JWT_REFRESH_EXPIRES_IN = 7d
   ```
   
   ```
   CORS_ORIGIN = https://systemink-web.onrender.com
   ```
   *Note: You'll update this after deploying the frontend*
   
   ```
   UPLOAD_DIR = ./uploads
   ```
   
   ```
   MAX_FILE_SIZE = 52428800
   ```
   
   ```
   SITE_URL = https://systemink-web.onrender.com
   ```
   *Note: You'll update this after deploying the frontend*

5. Click **"Create Web Service"**
6. **Wait for deployment** - This will take 5-10 minutes
7. **Check the logs** - Look for any errors
8. Once deployed, note your API URL: `https://systemink-api.onrender.com`

### Step 4: Run Database Migrations

After the API is deployed, you need to run Prisma migrations:

1. Go to your API service in Render Dashboard
2. Click on **"Shell"** tab
3. Run these commands one by one:
   ```bash
   cd apps/api
   pnpm prisma generate
   pnpm prisma migrate deploy
   ```
4. If migrations succeed, you'll see "All migrations have been successfully applied"

### Step 5: Seed the Database (Optional but Recommended)

In the same Shell, run:
```bash
pnpm db:seed
```

This creates:
- Admin user: `admin@systemink.dev` / `password123`
- Sample authors and posts

### Step 6: Update CORS_ORIGIN and SITE_URL

1. Go back to your API service → **"Environment"** tab
2. Update:
   - `CORS_ORIGIN` = `https://systemink-web.onrender.com` (or your custom domain)
   - `SITE_URL` = `https://systemink-web.onrender.com` (or your custom domain)
3. Click **"Save Changes"** - This will trigger a redeploy

### Step 7: Deploy Frontend Web Service

1. In Render Dashboard, click **"New +"** → **"Static Site"**
2. Connect your GitHub repository:
   - Select: `systemink.dev`
   - Click **"Connect"**
3. Configure:
   - **Name**: `systemink-web`
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Build Command**: 
     ```bash
     npm install -g pnpm@8.15.0 && pnpm install && pnpm --filter @systemink/shared build && pnpm --filter @systemink/web build
     ```
   - **Publish Directory**: `apps/web/dist`
   - **Plan**: `Starter` (Free tier)

4. **Environment Variables** - Click "Add Environment Variable":
   
   ```
   VITE_API_URL = https://systemink-api.onrender.com/api
   ```
   *Replace with your actual API URL from Step 3*

5. Click **"Create Static Site"**
6. **Wait for deployment** - This will take 3-5 minutes
7. Once deployed, note your frontend URL: `https://systemink-web.onrender.com`

### Step 8: Final Configuration

1. **Update API CORS_ORIGIN** (if you haven't):
   - Go to API service → Environment
   - Update `CORS_ORIGIN` to your frontend URL
   - Save and wait for redeploy

2. **Test Your Deployment**:
   - Visit your frontend URL
   - Try logging in with: `admin@systemink.dev` / `password123`
   - Create a test post
   - Check if images upload correctly

## 🔧 Troubleshooting Common Issues

### Issue 1: Build Fails - "pnpm: command not found" or "EROFS: read-only file system"

**Solution**: Use npm to install pnpm globally instead of corepack:
```bash
npm install -g pnpm@8.15.0 && pnpm install && pnpm --filter @systemink/shared build && pnpm --filter @systemink/api build
```

**Note**: Render's file system is read-only for system directories, so corepack won't work. Always use `npm install -g pnpm` instead.

### Issue 2: Database Connection Error

**Symptoms**: API fails to start, "Can't reach database server"

**Solutions**:
- Make sure you're using the **Internal Database URL** (not External)
- Check that database status is "Available" (green)
- Verify DATABASE_URL environment variable is set correctly
- Wait a few minutes after creating database before deploying API

### Issue 3: CORS Errors in Browser

**Symptoms**: Frontend can't connect to API, CORS errors in console

**Solutions**:
- Make sure `CORS_ORIGIN` in API matches your frontend URL exactly
- Include protocol: `https://systemink-web.onrender.com` (not just `systemink-web.onrender.com`)
- No trailing slash
- Redeploy API after changing CORS_ORIGIN

### Issue 4: Frontend Shows "Cannot connect to API"

**Symptoms**: Frontend loads but shows errors, API calls fail

**Solutions**:
- Check `VITE_API_URL` in frontend environment variables
- Should be: `https://systemink-api.onrender.com/api` (with `/api` at the end)
- Make sure API service is running (check status in dashboard)
- Check API logs for errors

### Issue 5: Prisma Migration Errors

**Symptoms**: "Migration failed" or "Schema drift detected"

**Solutions**:
- Make sure you ran `pnpm prisma generate` first
- Use `pnpm prisma migrate deploy` (not `migrate dev`)
- Check database connection string is correct
- If stuck, try: `pnpm prisma db push` (but this doesn't track migrations)

### Issue 6: Images Not Loading

**Symptoms**: Uploaded images show broken links

**Solutions**:
- Check `UPLOAD_DIR` is set to `./uploads` in API
- Verify API is serving static files from `/uploads` route
- Check file permissions
- Note: On free tier, uploaded files may be lost on redeploy (consider using S3/Cloudinary for production)

### Issue 7: Service Goes to Sleep (Free Tier)

**Symptoms**: First request after inactivity is slow (30+ seconds)

**Solution**: This is normal on Render's free tier. Services spin down after 15 minutes of inactivity. Consider:
- Upgrade to paid plan (always-on)
- Use a service like UptimeRobot to ping your API every 5 minutes
- Accept the cold start delay

## 📊 Monitoring Your Deployment

### Check Service Status
- Go to Render Dashboard
- Click on each service
- Check "Events" tab for deployment history
- Check "Logs" tab for real-time logs

### View API Logs
1. Go to API service → "Logs" tab
2. Watch for errors
3. Common log messages:
   - `🚀 API running on http://localhost:3000` = Success
   - Database connection errors = Check DATABASE_URL
   - Port already in use = Check PORT env var

### View Frontend Build Logs
1. Go to Web service → "Logs" tab
2. Check build output
3. Look for Vite build success message

## 🔐 Security Checklist

- [ ] Changed `JWT_SECRET` to a strong random string (32+ characters)
- [ ] Updated default admin password after first login
- [ ] Set `CORS_ORIGIN` to your actual frontend domain
- [ ] Don't commit `.env` files to GitHub
- [ ] Review API rate limiting settings
- [ ] Consider adding authentication to admin endpoints

## 🚀 Post-Deployment Steps

1. **Change Admin Password**:
   - Login with `admin@systemink.dev` / `password123`
   - Go to profile settings
   - Change password immediately

2. **Set Up Custom Domain** (Optional):
   - In Render Dashboard → Your service → Settings
   - Add custom domain
   - Update DNS records as instructed
   - Update `CORS_ORIGIN` and `SITE_URL` to new domain

3. **Set Up Image Storage** (Recommended):
   - Free tier: Files stored locally (may be lost on redeploy)
   - Production: Use AWS S3, Cloudinary, or similar
   - Update upload service to use external storage

4. **Enable Auto-Deploy**:
   - Already enabled by default
   - Every push to `main` branch triggers redeploy
   - Check "Auto-Deploy" setting in service settings

## 📞 Getting Help

If you encounter issues:

1. **Check Render Logs**: Most errors are visible in service logs
2. **Check Build Logs**: Look for compilation errors
3. **Verify Environment Variables**: Double-check all env vars are set correctly
4. **Test Locally First**: Make sure app works locally before deploying
5. **Render Support**: Free tier includes community support

## ✅ Deployment Checklist

Before considering deployment complete:

- [ ] Database created and running
- [ ] API service deployed and healthy
- [ ] Database migrations run successfully
- [ ] Frontend service deployed
- [ ] CORS_ORIGIN set correctly
- [ ] VITE_API_URL set correctly
- [ ] Can access frontend URL
- [ ] Can login to admin account
- [ ] Can create/edit posts
- [ ] Images upload successfully
- [ ] API health check works: `https://your-api-url.onrender.com/api/health`

## 🎉 Success!

If all checkboxes are checked, your SystemInk blog is live on Render! 

**Your URLs:**
- Frontend: `https://systemink-web.onrender.com`
- API: `https://systemink-api.onrender.com/api`
- Health Check: `https://systemink-api.onrender.com/api/health`

---

**Note**: On Render's free tier, services may spin down after inactivity. First request after 15+ minutes of inactivity will take 30-60 seconds to respond. This is normal and expected behavior.
