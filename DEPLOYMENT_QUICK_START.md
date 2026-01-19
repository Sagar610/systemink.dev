# 🚀 Quick Start - Render Deployment

**TL;DR**: Follow these steps in order. Read `RENDER_DEPLOYMENT.md` for detailed instructions.

## ⚡ 5-Minute Checklist

### 1. Push to GitHub ✅
```bash
.\deploy-to-github.ps1
```

### 2. Create Database on Render
- New → PostgreSQL
- Name: `systemink-database`
- Copy **Internal Database URL**

### 3. Deploy API Service
- New → Web Service
- Connect GitHub repo
- **Build Command**:
  ```
  npm install -g pnpm@8.15.0 && pnpm install && pnpm --filter @systemink/shared build && cd apps/api && npx prisma generate && cd ../.. && pnpm --filter @systemink/api build && cd apps/api && npx prisma migrate deploy && cd ../..
  ```
  *Migrations run automatically - no Shell needed!*
- **Start Command**:
  ```
  cd apps/api && pnpm start:prod
  ```
- **Environment Variables** (see `ENVIRONMENT_VARIABLES.md`):
  - `DATABASE_URL` = [Internal Database URL]
  - `JWT_SECRET` = [Generate random 32+ char string]
  - `CORS_ORIGIN` = `https://systemink-web.onrender.com` (update after frontend deploy)
  - `SITE_URL` = `https://systemink-web.onrender.com` (update after frontend deploy)
  - Plus others from `ENVIRONMENT_VARIABLES.md`

### 4. Migrations (Automatic!)
✅ **Migrations run automatically during build and on startup!**
- No Shell access needed
- Migrations run after build completes
- Also run on server startup as backup
- See `MIGRATIONS_WITHOUT_SHELL.md` for details

### 5. Deploy Frontend
- New → Static Site
- Connect GitHub repo
- **Build Command**:
  ```
  npm install -g pnpm@8.15.0 && pnpm install && pnpm --filter @systemink/shared build && pnpm --filter @systemink/web build
  ```
- **Publish Directory**: `apps/web/dist`
- **Environment Variable**:
  - `VITE_API_URL` = `https://systemink-api.onrender.com/api`

### 6. Update CORS
- API Service → Environment
- Update `CORS_ORIGIN` and `SITE_URL` to frontend URL
- Save (triggers redeploy)

## 🔗 Your URLs

- Frontend: `https://systemink-web.onrender.com`
- API: `https://systemink-api.onrender.com/api`
- Health: `https://systemink-api.onrender.com/api/health`

## 🆘 Common Issues

| Issue | Quick Fix |
|-------|-----------|
| Build fails - pnpm not found | Use build command with `npm install -g pnpm@8.15.0` |
| CORS errors | Check `CORS_ORIGIN` matches frontend URL exactly |
| Database connection fails | Use **Internal** Database URL, not External |
| Frontend can't reach API | Check `VITE_API_URL` includes `/api` at end |
| Service sleeping | Normal on free tier (15min inactivity) |

## 📚 Full Documentation

- **Detailed Guide**: `RENDER_DEPLOYMENT.md`
- **Environment Variables**: `ENVIRONMENT_VARIABLES.md`
- **Configuration**: `render.yaml`

## ✅ Test Your Deployment

1. Visit frontend URL
2. Login: `admin@systemink.dev` / `password123`
3. Create a test post
4. Check health endpoint: `/api/health`

---

**Need help?** Check `RENDER_DEPLOYMENT.md` troubleshooting section.
