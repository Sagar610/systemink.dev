# Simple Hosting Plan for SystemInk

## 🎯 Your Situation:
- ✅ You have IONOS Web Hosting Plus (can host static files)
- ❌ IONOS cannot host Node.js backend (need alternative)
- 💰 You want FREE hosting

---

## 📋 SIMPLE PLAN: What Goes Where?

```
┌─────────────────────────────────────┐
│  IONOS Web Hosting Plus             │
│  (You already have this)            │
│  ┌──────────────────────────────┐   │
│  │ Frontend (React files)       │   │
│  │ - index.html                 │   │
│  │ - CSS, JS files              │   │
│  │ - All static files           │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Render.com (FREE)                  │
│  ┌──────────────────────────────┐   │
│  │ Backend (NestJS)             │   │
│  │ + PostgreSQL Database        │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## ✅ STEP-BY-STEP: What to Do (In Order)

### STEP 1: Sign Up for Render.com (2 minutes)
**What:** Create free account for backend hosting

**How:**
1. Go to: https://render.com
2. Click **"Get Started for Free"**
3. Sign up with **GitHub** (easiest way)
   - If you don't have GitHub, create account at github.com first
4. Verify your email

**Done when:** You can see Render dashboard

---

### STEP 2: Create Database on Render (5 minutes)
**What:** Create free PostgreSQL database

**How:**
1. In Render dashboard, click **"New +"** button (top right)
2. Click **"PostgreSQL"**
3. Fill in:
   - **Name:** `systemink-db`
   - **Database:** `systemink`
   - **User:** `systemink_user`
   - **Region:** Choose closest to you (e.g., "Oregon" or "Singapore")
   - **PostgreSQL Version:** 14 or 15 (any is fine)
   - **Plan:** Select **"Free"** ⭐
4. Click **"Create Database"**
5. **WAIT** 2-3 minutes for database to be created

**Done when:** Database status shows "Available"

**IMPORTANT:** Save the **"Internal Database URL"** (looks like: `postgresql://user:pass@host:5432/systemink`)

---

### STEP 3: Push Your Code to GitHub (10 minutes)
**What:** Put your code on GitHub so Render can access it

**How:**

#### A. If you don't have Git repository yet:
```powershell
# Open PowerShell in your project folder
cd C:\Users\Administrator\Desktop\GTV\systemink.dev

# Initialize git
git init
git add .
git commit -m "Initial commit"

# Create new repository on GitHub.com (go to github.com, click "+", "New repository")
# Then connect:
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/systemink.git
git push -u origin main
```

#### B. If you already have GitHub repo:
Just make sure your latest code is pushed:
```powershell
git add .
git commit -m "Ready for deployment"
git push
```

**Done when:** Your code is visible on GitHub.com

---

### STEP 4: Deploy Backend on Render (10 minutes)
**What:** Deploy your NestJS backend to Render

**How:**
1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Click **"Connect GitHub"** → Select your repository
3. Configure:
   - **Name:** `systemink-api`
   - **Region:** Same as database
   - **Branch:** `main` (or `master`)
   - **Root Directory:** `apps/api` ⚠️ IMPORTANT
   - **Runtime:** `Node`
   - **Build Command:**
     ```
     cd ../.. && pnpm install && pnpm --filter @systemink/api build
     ```
   - **Start Command:**
     ```
     cd ../.. && node apps/api/dist/main.js
     ```
   - **Instance Type:** **Free** ⭐
4. Scroll down to **"Environment Variables"** section
5. Click **"Add Environment Variable"** and add these one by one:

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | Click "Link Database" → Select `systemink-db` (auto-fills) |
   | `NODE_ENV` | `production` |
   | `PORT` | `3000` |
   | `JWT_SECRET` | `your-random-secret-key-change-this-minimum-32-characters-long` |
   | `JWT_EXPIRES_IN` | `15m` |
   | `JWT_REFRESH_EXPIRES_IN` | `7d` |
   | `CORS_ORIGIN` | `https://systemink.com` |
   | `SITE_URL` | `https://systemink.com` |
   | `UPLOAD_DIR` | `./uploads` |
   | `MAX_FILE_SIZE` | `52428800` |

6. Click **"Create Web Service"**
7. **WAIT** 5-10 minutes for build to complete

**Done when:** Status shows "Live" and you see green checkmark

**Copy your backend URL** (looks like: `https://systemink-api.onrender.com`)

---

### STEP 5: Run Database Migrations (5 minutes)
**What:** Set up database tables

**How:**
1. In Render dashboard → Your backend service (`systemink-api`)
2. Go to **"Shell"** tab
3. Click **"Connect"**
4. Run these commands one by one:
   ```bash
   cd /opt/render/project/src
   cd ../..
   pnpm install
   cd apps/api
   pnpm db:generate
   npx prisma db push
   ```
5. Wait for completion

**Done when:** You see "Database synchronized" message

---

### STEP 6: Build Frontend for Production (5 minutes)
**What:** Prepare frontend files to upload to IONOS

**How:**
```powershell
# Open PowerShell
cd C:\Users\Administrator\Desktop\GTV\systemink.dev\apps\web

# Create production config file
echo "VITE_API_URL=https://systemink-api.onrender.com/api" > .env.production

# IMPORTANT: Replace "systemink-api.onrender.com" with YOUR actual Render backend URL from Step 4!

# Go to root and build
cd ..\..
pnpm --filter @systemink/web build
```

**Done when:** You see `apps/web/dist/` folder with files inside

---

### STEP 7: Upload Frontend to IONOS (10 minutes)
**What:** Upload React files to your IONOS hosting

**How:**
1. Log into **IONOS control panel**
2. Find your domain `systemink.com`
3. Open **"File Manager"** or **"FTP Access"**
4. Navigate to root directory (`htdocs/` or `public_html/`)
5. **Delete any existing files** (if any)
6. **Upload all files** from `apps/web/dist/` folder
   - Select all files and folders inside `dist/`
   - Upload them to root directory
7. Create `.htaccess` file in root with this content:
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

**Done when:** Files are uploaded and `.htaccess` is in place

---

### STEP 8: Test Your Website (2 minutes)
**What:** Verify everything works

**How:**
1. Visit: `https://systemink.com`
2. Open browser console (F12 → Console tab)
3. Check for errors
4. Try to browse posts, login, etc.

**If you see errors:**
- Check browser console for messages
- Verify backend URL is correct in frontend build
- Check Render dashboard if backend is "Live"

---

## 🎉 CONGRATULATIONS!

Your website is now live at: **https://systemink.com**

---

## 📝 Quick Reference: What You Need

### On Render.com:
- ✅ PostgreSQL Database (FREE)
- ✅ Web Service for Backend (FREE)
- ⚠️ Backend URL: `https://your-backend.onrender.com`

### On IONOS:
- ✅ Frontend static files (already have hosting)
- ✅ Domain: `systemink.com`

### On Your Computer:
- ✅ Frontend build files in `apps/web/dist/`

---

## ⚠️ Important Notes

### Render Free Tier Limitation:
- **Services sleep after 15 minutes** of no activity
- **First request after sleep takes 30-60 seconds** to wake up
- This is normal for free tier

### Keep Backend Awake (Optional - FREE):
Use **Uptime Robot** (free monitoring service):
1. Go to: https://uptimerobot.com
2. Sign up (free)
3. Add monitor:
   - Type: HTTP(s)
   - URL: `https://your-backend.onrender.com/api/posts`
   - Interval: 5 minutes
4. This keeps backend awake 24/7

---

## 🆘 If Something Goes Wrong

### Backend not working?
- Check Render dashboard → Logs tab
- Verify all environment variables are set
- Check database is linked

### Frontend not loading?
- Verify files are in root directory on IONOS
- Check `.htaccess` file exists
- Clear browser cache (Ctrl+F5)

### API calls failing?
- Check browser console (F12)
- Verify `VITE_API_URL` in frontend is correct
- Check CORS errors (may need to add your domain to CORS_ORIGIN)

---

## 📞 Need Help?

1. Check Render logs: Dashboard → Your Service → Logs
2. Check browser console: F12 → Console tab
3. Verify environment variables are set correctly

---

## ✅ Checklist

Print this and check off as you go:

- [ ] Step 1: Render.com account created
- [ ] Step 2: PostgreSQL database created on Render
- [ ] Step 3: Code pushed to GitHub
- [ ] Step 4: Backend deployed on Render
- [ ] Step 5: Database migrations run
- [ ] Step 6: Frontend built locally
- [ ] Step 7: Frontend uploaded to IONOS
- [ ] Step 8: Website tested and working
- [ ] (Optional) Uptime Robot set up

---

**You're ready! Start with Step 1! 🚀**
