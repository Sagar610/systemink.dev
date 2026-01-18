# 🚀 Deploy SystemInk - Step-by-Step Action Plan

## ✅ What I've Done For You

1. ✅ Added Render post-build script for automatic database migrations
2. ✅ Added packageManager config to help Render detect pnpm
3. ✅ Created `deploy-to-github.ps1` script to push code easily
4. ✅ Everything is ready for deployment!

---

## 📋 STEP-BY-STEP: Follow These Instructions

### STEP 1: Push Code to GitHub (5 minutes)

**Option A: Use the automated script (Easiest)**
```powershell
# Open PowerShell in your project folder
cd C:\Users\Administrator\Desktop\GTV\systemink.dev

# Run the deployment script
.\deploy-to-github.ps1
```

The script will:
- Check if git is initialized
- Add GitHub remote
- Stage all files
- Commit and push to GitHub

**Option B: Manual push**
```powershell
cd C:\Users\Administrator\Desktop\GTV\systemink.dev
git init
git add .
git commit -m "Ready for deployment"
git branch -M main
git remote add origin https://github.com/Sagar610/systemink.dev.git
git push -u origin main
```

**⚠️ If you get authentication errors:**
- GitHub no longer accepts passwords
- Use Personal Access Token:
  1. Go to: https://github.com/settings/tokens
  2. Generate new token (classic)
  3. Select scope: `repo`
  4. Copy token and use it as password when pushing

**✅ Done when:** Your code is visible on https://github.com/Sagar610/systemink.dev

---

### STEP 2: Sign Up for Render.com (2 minutes)

1. Go to: **https://render.com**
2. Click **"Get Started for Free"**
3. Sign up with **GitHub** (click "Continue with GitHub")
4. Authorize Render to access your GitHub
5. Verify your email

**✅ Done when:** You see Render dashboard

---

### STEP 3: Create PostgreSQL Database on Render (5 minutes)

1. In Render dashboard, click **"New +"** button (top right)
2. Click **"PostgreSQL"**
3. Fill in the form:
   - **Name:** `systemink-db`
   - **Database:** `systemink`
   - **User:** `systemink_user`
   - **Region:** Choose closest (e.g., "Oregon (US West)")
   - **PostgreSQL Version:** 15 (or latest)
   - **Plan:** Click **"Free"** ⭐
4. Click **"Create Database"**
5. **WAIT** 2-3 minutes

**✅ Done when:** Status shows "Available" (green)

**📝 Save this info:** You'll see "Internal Database URL" - this is auto-connected, but good to note.

---

### STEP 4: Deploy Backend API on Render (15 minutes)

1. In Render dashboard, click **"New +"** → **"Web Service"**

2. **Connect Repository:**
   - If prompted, click **"Connect GitHub"** or **"Connect Account"**
   - Find and select: **`Sagar610/systemink.dev`**
   - Click **"Connect"**

3. **Configure Service:**
   - **Name:** `systemink-api`
   - **Region:** Same region as database (important!)
   - **Branch:** `main`
   - **Root Directory:** `apps/api` ⚠️ **VERY IMPORTANT - Type this exactly**
   - **Runtime:** `Node`
   - **Build Command:** 
     ```
     cd ../.. && pnpm install --frozen-lockfile && pnpm --filter @systemink/api build
     ```
   - **Start Command:**
     ```
     cd ../.. && node apps/api/dist/main.js
     ```
   - **Instance Type:** Select **"Free"** ⭐

4. **Add Environment Variables:**
   Scroll down to "Environment Variables" section:

   Click **"Add Environment Variable"** for each:

   | Key | Value | Notes |
   |-----|-------|-------|
   | `DATABASE_URL` | Click **"Link Database"** → Select `systemink-db` | This auto-fills! |
   | `NODE_ENV` | `production` | |
   | `PORT` | `3000` | |
   | `JWT_SECRET` | `systemink-super-secret-jwt-key-production-2026-change-this` | Change this! |
   | `JWT_EXPIRES_IN` | `15m` | |
   | `JWT_REFRESH_EXPIRES_IN` | `7d` | |
   | `CORS_ORIGIN` | `https://systemink.com` | Your domain |
   | `SITE_URL` | `https://systemink.com` | Your domain |
   | `UPLOAD_DIR` | `./uploads` | |
   | `MAX_FILE_SIZE` | `52428800` | 50MB in bytes |

5. **Deploy:**
   - Scroll to bottom
   - Click **"Create Web Service"**
   - **WAIT** 5-10 minutes for build

**✅ Done when:** Status shows "Live" with green checkmark

**📝 Save your backend URL:** It will look like `https://systemink-api.onrender.com`

---

### STEP 5: Verify Backend is Working (2 minutes)

1. Click on your service `systemink-api` in Render dashboard
2. Go to **"Logs"** tab
3. Look for: `Nest application successfully started`
4. Go to **"Events"** tab
5. Look for: `render-postbuild` completed successfully (database migrations)

**If you see errors:**
- Check logs tab for error messages
- Verify all environment variables are set
- Make sure database is linked

**✅ Done when:** Logs show application started successfully

---

### STEP 6: Deploy Frontend Static Site on Render (10 minutes)

**Now we'll deploy the frontend on Render as a static site:**

1. In Render dashboard, click **"New +"** → **"Static Site"**

2. **Connect Repository:**
   - Select: **`Sagar610/systemink.dev`** (should already be connected)

3. **Configure Static Site:**
   - **Name:** `systemink-web`
   - **Branch:** `main`
   - **Root Directory:** `apps/web` ⚠️ **IMPORTANT - Type this exactly**
   - **Build Command:** 
     ```
     cd ../.. && pnpm install --frozen-lockfile && pnpm --filter @systemink/web build
     ```
   - **Publish Directory:** `dist`

4. **Add Environment Variable:**
   - **Key:** `VITE_API_URL`
   - **Value:** `https://systemink-api.onrender.com/api` ⚠️ **Replace with your actual backend URL from Step 4**

5. **Deploy:**
   - Click **"Create Static Site"**
   - **WAIT** 5-10 minutes for build

**✅ Done when:** Status shows "Live" with green checkmark

**📝 Save your frontend URL:** It will look like `https://systemink-web.onrender.com`

---

### STEP 7: Set Up Custom Domain (Optional - 5 minutes)

**If you want to use your custom domain (systemink.com) on Render:**

1. In Render dashboard → Your Static Site (`systemink-web`) → **Settings** → **Custom Domains**
2. Click **"Add Custom Domain"**
3. Enter: `systemink.com` and `www.systemink.com`
4. Render will show you DNS instructions
5. **Update DNS in your domain registrar:**
   - Add CNAME record: `www` → `systemink-web.onrender.com`
   - Add A record or ALIAS for root domain (or follow Render's instructions)
6. Render will automatically provision SSL certificate (free)

**✅ Done when:** Domain shows "Active" with SSL certificate

**Note:** If you don't set up custom domain, your site will be available at `https://systemink-web.onrender.com`

---

### STEP 8: Update Backend CORS Settings (2 minutes)

**Update your backend to allow requests from your new frontend URL:**

1. In Render dashboard → Your Backend Service (`systemink-api`) → **Environment**
2. Find `CORS_ORIGIN` environment variable
3. Click **"Edit"** and update the value:
   - If using Render URL: `https://systemink-web.onrender.com`
   - If using custom domain: `https://systemink.com`
   - Or allow both: `https://systemink.com,https://systemink-web.onrender.com`
4. Click **"Save Changes"**
5. Render will automatically redeploy your backend

**✅ Done when:** Backend redeploys with new CORS settings

---

### STEP 9: Test Your Website (5 minutes)

1. **Visit your website:**
   - Go to: `https://systemink-web.onrender.com` (or `https://systemink.com` if you set up custom domain)
   - Wait for it to load

2. **Check Browser Console:**
   - Press `F12` → Click **"Console"** tab
   - Look for errors (red text)

3. **Test Features:**
   - Browse posts
   - Try to login
   - Check if API calls work (Network tab in F12)

**✅ Done when:** Website loads and works!

---

## 🎉 Congratulations!

Your SystemInk blog is now live at: **https://systemink.com**

---

## 📝 Important URLs to Save

- **Backend API:** `https://systemink-api.onrender.com`
- **Frontend:** `https://systemink-web.onrender.com` (or `https://systemink.com` if custom domain)
- **GitHub Repo:** `https://github.com/Sagar610/systemink.dev`
- **Render Dashboard:** `https://dashboard.render.com`

---

## ⚠️ Important Notes

### Render Free Tier Behavior:
- ⏰ Services **sleep after 15 minutes** of inactivity
- 🐌 **First request after sleep** takes 30-60 seconds (waking up)
- ✅ This is normal for free tier

### Keep Services Awake (FREE Solution):
Use **Uptime Robot** (free monitoring) to keep both frontend and backend awake:
1. Go to: https://uptimerobot.com
2. Sign up (free)
3. Add monitors:
   - **Backend:** Type: HTTP(s), URL: `https://systemink-api.onrender.com/api/posts`, Interval: 5 minutes
   - **Frontend:** Type: HTTP(s), URL: `https://systemink-web.onrender.com`, Interval: 5 minutes
4. This keeps both services awake 24/7 (FREE tier allows this!)

---

## 🆘 Troubleshooting

### Backend won't start?
- Check Render **Logs** tab
- Verify `DATABASE_URL` is linked correctly
- Check all environment variables are set

### Frontend shows blank page?
- Check browser console (F12) for errors
- Verify frontend is "Live" on Render dashboard
- Check build logs in Render to see if build succeeded
- Clear browser cache (Ctrl+F5)

### API calls fail?
- Check `VITE_API_URL` environment variable in frontend service matches backend URL
- Verify backend is "Live" on Render
- Check `CORS_ORIGIN` in backend matches your frontend URL
- Check browser Network tab (F12) for CORS errors

---

## ✅ Quick Checklist

- [ ] Step 1: Code pushed to GitHub
- [ ] Step 2: Render.com account created
- [ ] Step 3: PostgreSQL database created
- [ ] Step 4: Backend deployed on Render
- [ ] Step 5: Backend logs show success
- [ ] Step 6: Frontend deployed on Render as static site
- [ ] Step 7: (Optional) Custom domain configured
- [ ] Step 8: Backend CORS settings updated
- [ ] Step 9: Website tested and working
- [ ] (Optional) Uptime Robot set up for both services

---

## 📞 Need Help?

1. **Render Issues:** Check Logs tab in Render dashboard
2. **Frontend Issues:** Check browser console (F12)
3. **Git Issues:** Make sure GitHub token is set up correctly

---

**You're all set! Follow the steps above one by one. Good luck! 🚀**
