# SystemInk Free Hosting Guide

Complete guide to host SystemInk for **FREE** without upgrading IONOS.

---

## Best Free Hosting Strategy

### Option 1: Hybrid (Recommended)
- **Frontend (React):** IONOS Web Hosting Plus (you already have this)
- **Backend (NestJS):** Render.com (FREE tier)
- **Database:** Render.com PostgreSQL (FREE tier)

**Cost: $0/month**

### Option 2: All-in-One (Simpler)
- **Everything:** Render.com (FREE tier)
  - Frontend + Backend + Database all on Render

**Cost: $0/month**

---

## Option 1: Hybrid Deployment (Recommended)

### Part A: Deploy Backend + Database on Render.com (FREE)

#### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub (free tier available)
3. Connect your GitHub account

#### Step 2: Create PostgreSQL Database
1. In Render dashboard: **New** → **PostgreSQL**
2. Name: `systemink-db`
3. Database: `systemink`
4. User: `systemink_user`
5. Region: Choose closest to you
6. **FREE Plan** (PostgreSQL - Free)
7. Click **Create Database**
8. **Save the Internal Database URL** (starts with `postgresql://...`)

#### Step 3: Deploy Backend Service
1. In Render dashboard: **New** → **Web Service**
2. Connect your GitHub repository (or upload code)
3. Configure:
   - **Name:** `systemink-api`
   - **Root Directory:** `apps/api`
   - **Environment:** `Node`
   - **Build Command:**
     ```bash
     cd ../.. && pnpm install && pnpm --filter @systemink/api build
     ```
   - **Start Command:**
     ```bash
     cd ../.. && node apps/api/dist/main.js
     ```
   - **Instance Type:** **FREE** (512 MB RAM)

#### Step 4: Add Environment Variables
In Render dashboard → Your Service → Environment:

```env
DATABASE_URL=${{systemink-db.DATABASE_URL}}
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-min-32-characters-random
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=https://systemink.com
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800
SITE_URL=https://systemink.com
```

**Important:**
- `DATABASE_URL` should auto-populate if you selected the database during setup
- Replace `JWT_SECRET` with a random 32+ character string
- Update `CORS_ORIGIN` to your frontend URL

#### Step 5: Deploy
1. Click **Create Web Service**
2. Render will build and deploy automatically
3. Wait 5-10 minutes for first deployment
4. **Copy your backend URL** (e.g., `https://systemink-api.onrender.com`)

#### Step 6: Run Database Migrations
After first deployment:
1. Go to Render dashboard → Your service → **Shell** tab
2. Or use Render's **Manual Deploy** → **Run Commands**:
   ```bash
   cd /opt/render/project/src
   cd ../..
   pnpm install
   cd apps/api
   pnpm db:generate
   npx prisma db push
   ```

**Or use Render's deploy hooks** (add to `apps/api/package.json`):
```json
"scripts": {
  "render-postbuild": "prisma generate && prisma db push"
}
```

---

### Part B: Deploy Frontend to IONOS

#### Step 1: Build Frontend Locally

```powershell
# On your local machine
cd C:\Users\Administrator\Desktop\GTV\systemink.dev\apps\web

# Create .env.production file
echo "VITE_API_URL=https://systemink-api.onrender.com/api" > .env.production

# Go to root and build
cd ..\..
pnpm --filter @systemink/web build
```

**Replace `https://systemink-api.onrender.com` with your actual Render backend URL**

#### Step 2: Upload to IONOS
1. Log into IONOS control panel
2. Open **File Manager** for `systemink.com`
3. Navigate to root directory (`htdocs/` or `public_html/`)
4. Upload **all files** from `apps/web/dist/` folder

#### Step 3: Create .htaccess
Create `.htaccess` file in root:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

Upload this file to IONOS root directory.

---

## Option 2: Everything on Render.com (Simpler)

### Deploy Everything on Render

#### Frontend on Render (Static Site)
1. **New** → **Static Site**
2. Connect GitHub repo
3. Root Directory: `apps/web`
4. Build Command: `cd ../.. && pnpm install && pnpm --filter @systemink/web build`
5. Publish Directory: `apps/web/dist`
6. Add Environment Variable:
   ```
   VITE_API_URL=https://systemink-api.onrender.com/api
   ```

#### Backend + Database
Same as Option 1, Part A above.

#### Custom Domain Setup
1. In Render → Your Static Site → **Settings** → **Custom Domains**
2. Add `systemink.com`
3. Update DNS in IONOS (CNAME to Render's domain)
4. Render provides free SSL automatically

---

## Alternative Free Options

### Option 3: Railway.app (Free Credits)
- **Free Tier:** $5/month free credits (enough for small app)
- Similar setup to Render
- Go to https://railway.app

### Option 4: Fly.io (Free Tier)
- **Free Tier:** 3 shared-cpu VMs, 3GB persistent volumes
- More complex setup but powerful
- Go to https://fly.io

### Option 5: Backend on Render + Frontend on Netlify/Vercel
- Netlify: https://netlify.com (free for static sites)
- Vercel: https://vercel.com (free for static sites)
- Both have free SSL and CDN

---

## File Uploads Configuration

Since backend is on Render, file uploads need special handling:

### Option A: Use Render's Disk Storage (Simple)
- Files stored on Render's disk (FREE tier includes 512 MB)
- Access via: `https://your-backend.onrender.com/uploads/...`
- **Limitation:** Files may be deleted on redeploy (FREE tier)

### Option B: Use Cloud Storage (Recommended for Production)
1. **Cloudinary** (Free tier: 25GB storage)
   - Sign up: https://cloudinary.com
   - Update backend to use Cloudinary SDK

2. **AWS S3** (Free tier: 5GB storage)
   - More complex setup

3. **Supabase Storage** (Free tier: 1GB storage)
   - Easy integration with PostgreSQL

---

## Important Notes

### Render Free Tier Limitations:
- ⚠️ **Services sleep after 15 minutes of inactivity** (FREE tier)
- First request after sleep takes 30-60 seconds to wake up
- Perfect for development and low-traffic sites
- For production with traffic: Consider paid plan ($7/month)

### Render Waking Up Service:
- Add **Uptime Robot** (free): https://uptimerobot.com
  - Monitor your backend URL every 5 minutes
  - Keeps service awake (FREE tier allows this)

### Database Backups:
- Render free PostgreSQL includes automatic backups
- Or use: Neon.tech (free PostgreSQL with better free tier)

---

## Step-by-Step: Quick Start (Render.com)

### 1. Database Setup
```
Render Dashboard → New → PostgreSQL
- Name: systemink-db
- Plan: FREE
- Create
```

### 2. Backend Setup
```
Render Dashboard → New → Web Service
- Connect GitHub repo
- Root Directory: apps/api
- Build: cd ../.. && pnpm install && pnpm --filter @systemink/api build
- Start: cd ../.. && node apps/api/dist/main.js
- Plan: FREE
- Add Environment Variables (see above)
- Create
```

### 3. Frontend Setup
**Option A - IONOS:**
- Build locally with backend URL
- Upload to IONOS File Manager

**Option B - Render:**
- New → Static Site
- Root: apps/web
- Build: cd ../.. && pnpm install && pnpm --filter @systemink/web build
- Publish: apps/web/dist

---

## Environment Variables Checklist

### Backend (.env on Render):
- [ ] `DATABASE_URL` (auto from Render PostgreSQL)
- [ ] `JWT_SECRET` (generate random 32+ chars)
- [ ] `JWT_EXPIRES_IN=15m`
- [ ] `JWT_REFRESH_EXPIRES_IN=7d`
- [ ] `CORS_ORIGIN=https://systemink.com` (or your frontend URL)
- [ ] `NODE_ENV=production`
- [ ] `PORT=3000`
- [ ] `SITE_URL=https://systemink.com`
- [ ] `UPLOAD_DIR=./uploads`
- [ ] `MAX_FILE_SIZE=52428800`

### Frontend (.env.production):
- [ ] `VITE_API_URL=https://your-backend.onrender.com/api`

---

## Testing Your Deployment

### 1. Test Backend
```
https://your-backend.onrender.com/api/posts
```
Should return JSON (may take 30-60 seconds on FREE tier if sleeping)

### 2. Test Frontend
```
https://systemink.com
```
Should load your React app

### 3. Test Integration
- Open browser console
- Check Network tab for API calls
- Verify no CORS errors

---

## Troubleshooting

### Backend Slow to Respond (First Request)
- **Cause:** FREE tier service sleeping
- **Fix:** Use Uptime Robot to ping every 5 minutes

### CORS Errors
- Verify `CORS_ORIGIN` in backend matches frontend URL
- Include both `https://systemink.com` and `http://localhost:5173` for local dev

### Database Connection Failed
- Check `DATABASE_URL` in Render environment variables
- Verify database is running (Render dashboard)

### Build Fails on Render
- Check build logs in Render dashboard
- Verify `pnpm` is installed (Render auto-detects)
- May need to add `packageManager: "pnpm@8.15.0"` to root `package.json`

---

## Recommended: Keep Service Awake (FREE)

Use **Uptime Robot** (free):
1. Go to https://uptimerobot.com
2. Add Monitor:
   - Type: HTTP(s)
   - URL: `https://your-backend.onrender.com/api/posts`
   - Interval: 5 minutes
3. This keeps your Render service awake 24/7

---

## Cost Summary

| Service | Plan | Cost |
|---------|------|------|
| Render.com (Backend) | FREE | $0 |
| Render.com (Database) | FREE | $0 |
| IONOS Web Hosting | Your Plan | Already Paid |
| **Total** | | **$0/month** |

---

## Next Steps

1. ✅ Sign up for Render.com
2. ✅ Create PostgreSQL database
3. ✅ Deploy backend service
4. ✅ Build and upload frontend to IONOS
5. ✅ Test everything
6. ✅ Set up Uptime Robot (optional but recommended)

---

**Your application will be live for FREE! 🎉**

**Quick Links:**
- Render.com: https://render.com
- Uptime Robot: https://uptimerobot.com
- Cloudinary (optional): https://cloudinary.com
