# SystemInk

A production-ready multi-author blogging platform built with React, NestJS, PostgreSQL, and Prisma.

## Tech Stack

### Frontend
- React 18 + Vite + TypeScript
- TailwindCSS + shadcn/ui
- React Router for routing
- TanStack Query for data fetching
- Zustand for state management

### Backend
- NestJS + TypeScript
- Prisma ORM
- PostgreSQL
- JWT authentication with refresh tokens

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- PostgreSQL >= 14

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Database

Create a `.env` file in `apps/api`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/systemink?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=5242880
PORT=3000
SITE_URL="http://localhost:5173"
```

### 3. Run Database Migrations

```bash
pnpm db:migrate
```

### 4. Seed the Database

```bash
pnpm db:seed
```

This will create:
- An admin user: `admin@systemink.dev` / `password123`
- Two author users: `jane@systemink.dev` / `password123` and `john@systemink.dev` / `password123`
- Sample posts and tags

### 5. Start Development Servers

```bash
pnpm dev
```

This will start:
- Frontend on http://localhost:5173
- Backend API on http://localhost:3000

## Scripts

### Root Level

- `pnpm dev` - Run frontend and backend in development mode
- `pnpm build` - Build all packages
- `pnpm test` - Run tests
- `pnpm lint` - Lint all packages
- `pnpm format` - Format code with Prettier
- `pnpm db:migrate` - Run database migrations
- `pnpm db:seed` - Seed the database
- `pnpm db:studio` - Open Prisma Studio

## Project Structure

```
systemink/
├── apps/
│   ├── api/          # NestJS backend
│   └── web/          # React frontend
├── packages/
│   └── shared/       # Shared types and utilities
└── pnpm-workspace.yaml
```

## Features

### Phase 1 (MVP)
- ✅ User authentication (signup, login, forgot password, reset password)
- ✅ Role-based access control (ADMIN, EDITOR, AUTHOR)
- ✅ Post CRUD operations
- ✅ Markdown editor with live preview
- ✅ Tag management
- ✅ Full-text search
- ✅ RSS feed, sitemap.xml, robots.txt
- ✅ Dark mode
- ✅ Responsive design
- ✅ Image uploads (cover images, avatars)
- ✅ Post scheduling
- ✅ Dashboard for authors
- ✅ Admin panel

### Phase 2
- ✅ Post scheduling with cron job
- ✅ Comments with moderation
- ✅ View tracking for trending posts
- ✅ Rate limiting
- ⏳ Basic unit/integration tests
- ⏳ Caching headers (ETag)

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Sign up
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/forgot` - Forgot password
- `POST /api/auth/reset` - Reset password
- `GET /api/auth/me` - Get current user

### Posts
- `GET /api/posts` - List posts (query: status, tag, author, q, page, limit)
- `GET /api/posts/featured` - Get featured posts
- `GET /api/posts/trending` - Get trending posts
- `GET /api/posts/search` - Search posts (query: q, page, limit)
- `GET /api/posts/:id` - Get post by ID (authenticated)
- `GET /api/posts/slug/:slug` - Get post by slug
- `GET /api/posts/author/:username` - Get posts by author
- `POST /api/posts` - Create post (authenticated)
- `PUT /api/posts/:id` - Update post (authenticated, owner/admin/editor)
- `POST /api/posts/:id/publish` - Publish post
- `POST /api/posts/:id/unpublish` - Unpublish post
- `DELETE /api/posts/:id` - Delete post (authenticated, owner/admin)
- `POST /api/posts/:id/view` - Increment view count

### Tags
- `GET /api/tags` - List all tags
- `GET /api/tags/:slug` - Get tag by slug
- `POST /api/tags` - Create tag (authenticated, admin/editor)
- `DELETE /api/tags/:id` - Delete tag (authenticated, admin)

### Users
- `GET /api/users/authors` - List all authors
- `GET /api/users/:username` - Get user by username
- `PUT /api/users/me` - Update own profile (authenticated)
- `GET /api/users` - List all users (admin only)
- `PUT /api/users/:id/role` - Update user role (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

### Comments
- `GET /api/posts/:postId/comments` - Get comments for a post
- `POST /api/posts/:postId/comments` - Create comment (authenticated)
- `DELETE /api/posts/:postId/comments/:id` - Delete comment (authenticated, owner/post author/admin)

### Uploads
- `POST /api/uploads` - Upload image (authenticated, query: type=cover|avatar)

### Feed
- `GET /api/rss.xml` - RSS feed
- `GET /api/sitemap.xml` - Sitemap
- `GET /api/robots.txt` - Robots.txt

## License

MIT
