# 🚀 Vercel Deployment Guide for SystemInk

## Overview

You can host SystemInk on Vercel, but it requires some modifications because:
- ✅ **Frontend (React/Vite)**: Perfect for Vercel
- ⚠️ **Backend (NestJS)**: Needs serverless adapter
- ⚠️ **Database**: Vercel doesn't provide databases (use external service)

---

## ⚠️ Important Considerations

### Challenges with NestJS on Vercel:

1. **Serverless Functions**: NestJS needs to be adapted for Vercel's serverless environment
2. **File Uploads**: Multer file uploads work differently in serverless
3. **Scheduled Tasks**: `@nestjs/schedule` won't work (serverless functions are stateless)
4. **Long-running Processes**: Not suitable for serverless

### Better Alternatives:

- **Render.com** (current setup) - Better for full NestJS apps
- **Railway.app** - Similar to Render
- **Fly.io** - Good for full-stack apps
- **Vercel** - Best for frontend + API routes (not full frameworks)

---

## Option 1: Frontend Only on Vercel (Recommended)

Deploy only the frontend on Vercel, keep backend on Render:

### Steps:

1. **Deploy Frontend to Vercel:**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   cd apps/web
   vercel
   ```

2. **Configure Build Settings:**
   - **Framework Preset**: Vite
   - **Root Directory**: `apps/web`
   - **Build Command**: `cd ../.. && pnpm install && pnpm --filter @systemink/web build`
   - **Output Directory**: `dist`
   - **Install Command**: `cd ../.. && pnpm install`

3. **Environment Variables:**
   - `VITE_API_URL`: Your Render backend URL (e.g., `https://systemink-api.onrender.com/api`)

4. **Keep Backend on Render:**
   - Your current `render.yaml` setup works perfectly
   - No changes needed

**Cost**: FREE (both Vercel frontend + Render backend)

---

## Option 2: Full Stack on Vercel (Requires Code Changes)

If you want everything on Vercel, you need to:

### 1. Install Vercel Serverless Adapter for NestJS

```bash
cd apps/api
pnpm add @vercel/node
```

### 2. Create Serverless Entry Point

Create `apps/api/vercel.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import * as express from 'express';
import { Handler } from '@vercel/node';

let cachedApp: express.Application;

async function bootstrap(): Promise<express.Application> {
  if (cachedApp) {
    return cachedApp;
  }

  const expressApp = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  // Your existing middleware setup
  app.enableCors();
  app.setGlobalPrefix('api');

  await app.init();
  cachedApp = expressApp;
  return expressApp;
}

export default async function handler(req: any, res: any) {
  const app = await bootstrap();
  return app(req, res);
}
```

### 3. Update `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "apps/web/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "apps/web/dist"
      }
    },
    {
      "src": "apps/api/vercel.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "apps/api/vercel.ts"
    },
    {
      "src": "/(.*)",
      "dest": "apps/web/dist/$1"
    }
  ]
}
```

### 4. Issues to Fix:

- ❌ **File Uploads**: Multer won't work - need to use Vercel Blob Storage or S3
- ❌ **Scheduled Tasks**: Remove `@nestjs/schedule` or use external cron service
- ❌ **Static File Serving**: Uploads need external storage (Vercel Blob, S3, Cloudinary)

---

## Option 3: Hybrid (Best of Both Worlds)

- **Frontend**: Vercel (fast CDN, great for React)
- **Backend**: Render (full NestJS support, no limitations)
- **Database**: Render PostgreSQL (or Supabase/Neon)

**This is the recommended approach!**

---

## Quick Start: Frontend on Vercel

### 1. Install Vercel CLI:
```bash
npm i -g vercel
```

### 2. Deploy Frontend:
```bash
cd apps/web
vercel
```

### 3. Configure in Vercel Dashboard:
- Go to: https://vercel.com/dashboard
- Select your project
- Settings → Environment Variables
- Add: `VITE_API_URL=https://your-render-backend.onrender.com/api`

### 4. Update Render Backend CORS:
In Render dashboard → Environment Variables:
- `CORS_ORIGIN`: Add your Vercel domain (e.g., `https://your-app.vercel.app`)

---

## Comparison: Vercel vs Render

| Feature | Vercel | Render |
|---------|--------|--------|
| **Frontend** | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐ Good |
| **Backend (NestJS)** | ⚠️ Needs adaptation | ⭐⭐⭐⭐⭐ Perfect |
| **Database** | ❌ External only | ✅ Included |
| **File Uploads** | ⚠️ External storage | ✅ Built-in |
| **Scheduled Tasks** | ❌ External cron | ✅ Built-in |
| **Cost** | Free tier available | Free tier available |
| **Monorepo Support** | ✅ Yes | ✅ Yes |

---

## Recommendation

**Use Render for everything** (your current setup) because:
1. ✅ NestJS works perfectly without modifications
2. ✅ Database included
3. ✅ File uploads work out of the box
4. ✅ Scheduled tasks work
5. ✅ Simpler setup

**OR use Vercel for frontend only** if you want:
- Faster global CDN for static assets
- Better performance for frontend
- Keep backend on Render

---

## Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **NestJS on Vercel**: https://docs.nestjs.com/faq/serverless
- **Render Docs**: https://render.com/docs
