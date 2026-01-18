# 🔧 Fix Render Build Error - Lockfile Issue

## The Problem

You're seeing this error:
```
ERR_PNPM_NO_LOCKFILE  Cannot install with "frozen-lockfile" because pnpm-lock.yaml is absent
```

This happens because your Render service was created with a build command that uses `--frozen-lockfile`, but Render can't find the lockfile during build.

## ✅ Solution: Update Build Command in Render Dashboard

### Step 1: Go to Your Service
1. Log into **Render Dashboard**: https://dashboard.render.com
2. Click on your service: **`systemink-api`**

### Step 2: Open Settings
1. Click the **"Settings"** tab (or click "Settings" in the left sidebar)

### Step 3: Find Build Command
1. Scroll down to **"Build & Deploy"** section
2. Find the **"Build Command"** field

### Step 4: Update the Command
**CURRENT (wrong - causing error):**
```
cd ../.. && pnpm install --frozen-lockfile && pnpm --filter @systemink/api build
```

**CHANGE TO (correct - fixed):**
```
cd ../.. && pnpm install && pnpm --filter @systemink/api build
```

**What to change:**
- Remove `--frozen-lockfile` from the command
- Keep everything else the same

### Step 5: Save and Deploy
1. Click **"Save Changes"** button at the bottom
2. Render will automatically trigger a new deployment
3. Go to **"Events"** or **"Logs"** tab to watch the build

---

## 🎯 Quick Copy-Paste Commands

### Backend Build Command (for `systemink-api`):
```
cd ../.. && pnpm install && pnpm --filter @systemink/shared build && cd apps/api && pnpm db:generate && cd ../.. && pnpm --filter @systemink/api build
```

### Frontend Build Command (for `systemink-web` - if you created it):
```
cd ../.. && pnpm install && pnpm --filter @systemink/web build
```

---

## 📸 Visual Guide

In Render Dashboard:
1. **Service** → **Settings** → Scroll to **"Build & Deploy"**
2. Find **"Build Command"** field
3. Replace the entire command with the fixed version above
4. Click **"Save Changes"**

---

## ✅ Verify the Fix

After saving:
1. Go to **"Events"** tab
2. You should see a new deployment starting
3. Go to **"Logs"** tab
4. The build should now succeed without the lockfile error

---

## 🆘 If You Can't Find Build Command Setting

If you can't find the build command setting:
1. Make sure you're in the **Settings** tab
2. Try **"Manual Deploy"** → **"Clear build cache & redeploy"**
3. Or recreate the service using the updated `render.yaml` Blueprint

---

## 📝 Why This Happens

When you create a service manually in Render:
- The build command is saved in Render's database
- It doesn't automatically read from `render.yaml` 
- You need to manually update it if the command changes

The `--frozen-lockfile` flag requires `pnpm-lock.yaml` to exist, but Render's build environment might have issues finding it with the `rootDir: apps/api` configuration. Removing this flag allows pnpm to work with or without the lockfile.

---

**After updating, your build should work! 🚀**
