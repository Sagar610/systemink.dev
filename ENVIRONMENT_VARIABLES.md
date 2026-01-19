# Environment Variables Reference

This document lists all environment variables required for SystemInk deployment.

## 🔵 Backend API (apps/api/.env)

### Required Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db?schema=public` | ✅ Yes |
| `JWT_SECRET` | Secret key for JWT tokens (min 32 chars) | `your-super-secret-jwt-key-change-this-min-32-characters-random-string` | ✅ Yes |
| `CORS_ORIGIN` | Frontend URL for CORS | `https://systemink-web.onrender.com` | ✅ Yes |
| `PORT` | Server port | `3000` | ⚠️ Optional (default: 3000) |
| `NODE_ENV` | Environment mode | `production` | ⚠️ Optional |

### Optional Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `JWT_EXPIRES_IN` | Access token expiration | `15m` | ❌ No |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | `7d` | ❌ No |
| `UPLOAD_DIR` | Directory for uploaded files | `./uploads` | ❌ No |
| `MAX_FILE_SIZE` | Maximum file upload size (bytes) | `52428800` (50MB) | ❌ No |
| `SITE_URL` | Base URL of your site | `http://localhost:5173` | ❌ No |

## 🟢 Frontend (apps/web/.env.production)

### Required Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API URL | `https://systemink-api.onrender.com/api` | ✅ Yes |

**Note**: Vite requires `VITE_` prefix for environment variables to be exposed to the client.

## 📝 Render.com Configuration

### Backend API Service Environment Variables

```
NODE_ENV=production
PORT=3000
DATABASE_URL=[Internal Database URL from Render]
JWT_SECRET=[Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=https://systemink-web.onrender.com
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800
SITE_URL=https://systemink-web.onrender.com
```

### Frontend Static Site Environment Variables

```
VITE_API_URL=https://systemink-api.onrender.com/api
```

## 🔐 Security Notes

1. **JWT_SECRET**: 
   - Must be at least 32 characters
   - Use a cryptographically secure random string
   - Never commit to Git
   - Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

2. **DATABASE_URL**:
   - Use **Internal Database URL** on Render (not External)
   - Format: `postgresql://user:password@host:port/database?schema=public`
   - Never commit to Git

3. **CORS_ORIGIN**:
   - Must match your frontend URL exactly
   - Include protocol (`https://`)
   - No trailing slash
   - Update after deploying frontend

## 🧪 Testing Environment Variables

### Local Development (.env in apps/api/)

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/systemink?schema=public"
JWT_SECRET="dev-secret-key-change-in-production-min-32-characters"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=52428800
PORT=3000
NODE_ENV=development
SITE_URL="http://localhost:5173"
```

### Local Frontend (.env.local in apps/web/)

```env
VITE_API_URL=http://localhost:3000/api
```

## ✅ Verification Checklist

Before deploying, verify:

- [ ] All required variables are set
- [ ] `JWT_SECRET` is at least 32 characters
- [ ] `DATABASE_URL` uses Internal URL (on Render)
- [ ] `CORS_ORIGIN` matches frontend URL exactly
- [ ] `VITE_API_URL` includes `/api` at the end
- [ ] No `.env` files are committed to Git
- [ ] Environment variables are set in Render dashboard

## 🚨 Common Mistakes

1. **Missing `/api` in VITE_API_URL**: Should be `https://api-url.onrender.com/api` not `https://api-url.onrender.com`
2. **Wrong DATABASE_URL**: Using External URL instead of Internal URL on Render
3. **CORS_ORIGIN mismatch**: Must match frontend URL exactly (including protocol)
4. **Short JWT_SECRET**: Must be at least 32 characters
5. **Missing VITE_ prefix**: Frontend env vars must start with `VITE_`
